# Design Document

## Overview

This design outlines the integration of a real-time simulation mode into the World History Simulation Engine. The real-time mode will automatically process turns at configurable intervals while maintaining full compatibility with the existing turn-based architecture. This feature showcases the WASM consciousness engine's performance capabilities to potential npm package customers by demonstrating continuous, high-speed simulation with live performance metrics.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      WorldHistorySimInterface (Enhanced)              │  │
│  │  - Mode toggle controls (Turn-based ↔ Real-time)     │  │
│  │  - Real-time speed controls (1x, 2x, 5x, 10x, 25x)   │  │
│  │  - Live performance dashboard                         │  │
│  │  - TPS meter and processing time charts               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Context Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      SimulationContext (Enhanced)                     │  │
│  │  - isRealTimeMode: boolean                            │  │
│  │  - realTimeSpeed: number (TPS)                        │  │
│  │  - realTimeIntervalId: number | null                  │  │
│  │  - startRealTimeMode(speed): void                     │  │
│  │  - stopRealTimeMode(): void                           │  │
│  │  - adjustRealTimeSpeed(speed): void                   │  │
│  │  - realTimeMetrics: PerformanceMetrics                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         SimulationService (Unchanged)                 │  │
│  │  - processTurn() continues to work identically        │  │
│  │  - Returns turnSummary with processing time           │  │
│  │  - Manages world state and turn history               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      LODManager (Unchanged)                           │  │
│  │  - processPreTurnLOD()                                │  │
│  │  - processPostTurnLOD()                               │  │
│  │  - Batch WASM processing for group characters         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      BehavioralStateService (Unchanged)               │  │
│  │  - Uses WASM for consciousness calculations           │  │
│  │  - Automatic fallback to JavaScript                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Real-Time Mode Control Flow

```
User clicks "Start Real-Time"
         ↓
SimulationContext.startRealTimeMode(speed)
         ↓
Calculate interval = 1000 / speed (ms)
         ↓
setInterval(() => processTurn(), interval)
         ↓
Store intervalId in realTimeIntervalId
         ↓
Set isRealTimeMode = true
         ↓
┌─────────────────────────────────────┐
│   Automatic Turn Processing Loop    │
│                                      │
│   Every [interval] ms:               │
│   1. Call processTurn()              │
│   2. Measure actual processing time  │
│   3. Calculate actual TPS            │
│   4. Update realTimeMetrics          │
│   5. Trigger UI re-render            │
│                                      │
│   Continue until stopRealTimeMode()  │
└─────────────────────────────────────┘
         ↓
User clicks "Stop Real-Time"
         ↓
SimulationContext.stopRealTimeMode()
         ↓
clearInterval(realTimeIntervalId)
         ↓
Set isRealTimeMode = false
         ↓
Return to turn-based mode
```


## Components and Interfaces

### 1. SimulationContext Enhancements

**Location**: `sim-engine/src/presentation/contexts/SimulationContext.js`

**New State Variables**:
```javascript
// Real-time mode state
const [isRealTimeMode, setIsRealTimeMode] = useState(false);
const [realTimeSpeed, setRealTimeSpeed] = useState(1); // TPS (turns per second)
const [realTimeIntervalId, setRealTimeIntervalId] = useState(null);
const [realTimeMetrics, setRealTimeMetrics] = useState({
  actualTPS: 0,
  targetTPS: 1,
  averageTurnTime: 0,
  turnTimeHistory: [], // Last 10 turn times
  totalTurnsProcessed: 0,
  startTime: null,
  lastTurnTime: null
});
```

**New Methods**:
```javascript
/**
 * Start real-time simulation mode
 * @param {number} speed - Target turns per second (TPS)
 */
const startRealTimeMode = useCallback((speed = 1) => {
  if (isRealTimeMode) {
    console.warn('Real-time mode already active');
    return;
  }

  if (!canProcessTurn) {
    console.error('Cannot start real-time mode: simulation not ready');
    return;
  }

  // Calculate interval in milliseconds
  const interval = 1000 / speed;

  // Initialize metrics
  setRealTimeMetrics({
    actualTPS: 0,
    targetTPS: speed,
    averageTurnTime: 0,
    turnTimeHistory: [],
    totalTurnsProcessed: 0,
    startTime: Date.now(),
    lastTurnTime: Date.now()
  });

  // Create interval for automatic turn processing
  const intervalId = setInterval(async () => {
    const turnStartTime = performance.now();

    try {
      // Call existing processTurn function
      await processTurn();

      // Measure turn processing time
      const turnEndTime = performance.now();
      const turnDuration = turnEndTime - turnStartTime;

      // Update metrics
      setRealTimeMetrics(prev => {
        const newHistory = [...prev.turnTimeHistory, turnDuration].slice(-10);
        const avgTurnTime = newHistory.reduce((sum, t) => sum + t, 0) / newHistory.length;
        const now = Date.now();
        const elapsedSeconds = (now - prev.startTime) / 1000;
        const actualTPS = prev.totalTurnsProcessed / elapsedSeconds;

        return {
          ...prev,
          averageTurnTime: avgTurnTime,
          turnTimeHistory: newHistory,
          totalTurnsProcessed: prev.totalTurnsProcessed + 1,
          actualTPS: actualTPS,
          lastTurnTime: now
        };
      });

    } catch (error) {
      console.error('Error during real-time turn processing:', error);
      // Stop real-time mode on error
      stopRealTimeMode();
    }
  }, interval);

  setRealTimeIntervalId(intervalId);
  setRealTimeSpeed(speed);
  setIsRealTimeMode(true);

  console.log(`Real-time mode started at ${speed} TPS (${interval}ms interval)`);
}, [isRealTimeMode, canProcessTurn, processTurn]);

/**
 * Stop real-time simulation mode
 */
const stopRealTimeMode = useCallback(() => {
  if (!isRealTimeMode || !realTimeIntervalId) {
    console.warn('Real-time mode not active');
    return;
  }

  clearInterval(realTimeIntervalId);
  setRealTimeIntervalId(null);
  setIsRealTimeMode(false);

  console.log('Real-time mode stopped');
  console.log('Final metrics:', realTimeMetrics);
}, [isRealTimeMode, realTimeIntervalId, realTimeMetrics]);

/**
 * Adjust real-time simulation speed
 * @param {number} newSpeed - New target TPS
 */
const adjustRealTimeSpeed = useCallback((newSpeed) => {
  if (!isRealTimeMode) {
    console.warn('Cannot adjust speed: real-time mode not active');
    return;
  }

  // Stop current interval
  if (realTimeIntervalId) {
    clearInterval(realTimeIntervalId);
  }

  // Start new interval with updated speed
  const interval = 1000 / newSpeed;
  const intervalId = setInterval(async () => {
    const turnStartTime = performance.now();

    try {
      await processTurn();

      const turnEndTime = performance.now();
      const turnDuration = turnEndTime - turnStartTime;

      setRealTimeMetrics(prev => {
        const newHistory = [...prev.turnTimeHistory, turnDuration].slice(-10);
        const avgTurnTime = newHistory.reduce((sum, t) => sum + t, 0) / newHistory.length;
        const now = Date.now();
        const elapsedSeconds = (now - prev.startTime) / 1000;
        const actualTPS = prev.totalTurnsProcessed / elapsedSeconds;

        return {
          ...prev,
          targetTPS: newSpeed,
          averageTurnTime: avgTurnTime,
          turnTimeHistory: newHistory,
          totalTurnsProcessed: prev.totalTurnsProcessed + 1,
          actualTPS: actualTPS,
          lastTurnTime: now
        };
      });

    } catch (error) {
      console.error('Error during real-time turn processing:', error);
      stopRealTimeMode();
    }
  }, interval);

  setRealTimeIntervalId(intervalId);
  setRealTimeSpeed(newSpeed);

  console.log(`Real-time speed adjusted to ${newSpeed} TPS (${interval}ms interval)`);
}, [isRealTimeMode, realTimeIntervalId, processTurn, stopRealTimeMode]);
```

**Updated Context Value**:
```javascript
const value = {
  // ... existing context values
  
  // Real-time mode additions
  isRealTimeMode,
  realTimeSpeed,
  realTimeMetrics,
  startRealTimeMode,
  stopRealTimeMode,
  adjustRealTimeSpeed,
  canStartRealTime: canProcessTurn && !isRealTimeMode
};
```


### 2. WorldHistorySimInterface Enhancements

**Location**: `sim-engine/src/presentation/components/WorldHistorySimInterface.js`

**New UI Components**:

#### Mode Toggle Control
```javascript
const ModeToggleControl = () => {
  const {
    isRealTimeMode,
    canStartRealTime,
    startRealTimeMode,
    stopRealTimeMode,
    realTimeSpeed
  } = useSimulationContext();

  return (
    <div className="flex items-center space-x-3 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Mode:
      </span>
      
      <button
        onClick={() => {
          if (isRealTimeMode) {
            stopRealTimeMode();
          } else {
            startRealTimeMode(1); // Start at 1 TPS
          }
        }}
        disabled={!canStartRealTime && !isRealTimeMode}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isRealTimeMode
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : canStartRealTime
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isRealTimeMode ? (
          <>
            <span className="mr-2">⏸</span>
            Stop Real-Time
          </>
        ) : (
          <>
            <span className="mr-2">▶</span>
            Start Real-Time
          </>
        )}
      </button>

      {isRealTimeMode && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            Running at {realTimeSpeed}x
          </span>
        </div>
      )}
    </div>
  );
};
```

#### Speed Control Panel
```javascript
const SpeedControlPanel = () => {
  const {
    isRealTimeMode,
    realTimeSpeed,
    adjustRealTimeSpeed,
    realTimeMetrics
  } = useSimulationContext();

  const presetSpeeds = [1, 2, 5, 10, 25];
  const [customSpeed, setCustomSpeed] = useState(realTimeSpeed);

  if (!isRealTimeMode) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Simulation Speed Control
      </h3>

      {/* Preset Speed Buttons */}
      <div className="flex space-x-2 mb-4">
        {presetSpeeds.map(speed => (
          <button
            key={speed}
            onClick={() => adjustRealTimeSpeed(speed)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              realTimeSpeed === speed
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Custom Speed Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Speed: {customSpeed.toFixed(1)} TPS
        </label>
        <input
          type="range"
          min="0.1"
          max="50"
          step="0.1"
          value={customSpeed}
          onChange={(e) => setCustomSpeed(parseFloat(e.target.value))}
          onMouseUp={() => adjustRealTimeSpeed(customSpeed)}
          className="w-full"
        />
      </div>

      {/* Performance Warning */}
      {realTimeMetrics.actualTPS < realTimeMetrics.targetTPS * 0.8 && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 rounded-lg p-3">
          <div className="flex items-start">
            <span className="text-yellow-600 dark:text-yellow-400 mr-2">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Performance Warning
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Target: {realTimeMetrics.targetTPS.toFixed(1)} TPS, 
                Actual: {realTimeMetrics.actualTPS.toFixed(1)} TPS
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Consider reducing speed or NPC count for better performance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### Real-Time Performance Dashboard
```javascript
const RealTimePerformanceDashboard = () => {
  const {
    isRealTimeMode,
    realTimeMetrics,
    lodStats,
    lodProcessingMetrics,
    currentSimulationState
  } = useSimulationContext();

  if (!isRealTimeMode) return null;

  const getPerformanceColor = (actualTPS, targetTPS) => {
    const ratio = actualTPS / targetTPS;
    if (ratio >= 0.9) return 'text-green-600 dark:text-green-400';
    if (ratio >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Real-Time Performance Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Actual TPS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Actual TPS
          </div>
          <div className={`text-2xl font-bold ${getPerformanceColor(realTimeMetrics.actualTPS, realTimeMetrics.targetTPS)}`}>
            {realTimeMetrics.actualTPS.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Target: {realTimeMetrics.targetTPS.toFixed(1)}
          </div>
        </div>

        {/* Average Turn Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Avg Turn Time
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {realTimeMetrics.averageTurnTime.toFixed(1)}ms
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Last 10 turns
          </div>
        </div>

        {/* Total Turns Processed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Turns Processed
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {realTimeMetrics.totalTurnsProcessed}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Since start
          </div>
        </div>

        {/* LOD Processing Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            LOD Processing
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {lodProcessingMetrics?.averageTurnDuration?.toFixed(1) || 'N/A'}ms
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Average
          </div>
        </div>
      </div>

      {/* LOD Distribution */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          LOD Tier Distribution
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Hero: {lodStats?.hero || 0}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Group: {lodStats?.group || 0}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Background: {lodStats?.background || 0}
            </span>
          </div>
        </div>
      </div>

      {/* WASM Status (if available) */}
      {currentSimulationState?.wasmStatus && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                currentSimulationState.wasmStatus.enabled ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                WASM Acceleration
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentSimulationState.wasmStatus.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
```


**Updated Header Section**:
```javascript
// In WorldHistorySimInterface component
<header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          World History Simulation
        </h1>
        
        {/* Existing turn counter */}
        <div className="flex items-center space-x-3 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Turn: {currentTurn !== null ? currentTurn : '--'}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-300">
              {formatTimeDisplay(currentSimulationState?.time)}
            </span>
          </div>
          {canProcessTurn && !isRealTimeMode && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* NEW: Mode Toggle Control */}
        <ModeToggleControl />
      </div>

      {/* Turn Controls - Updated */}
      <div className="flex items-center space-x-3">
        {/* Manual turn button - disabled in real-time mode */}
        <button
          onClick={handleNextTurn}
          disabled={!canProcessTurn || isRealTimeMode}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            canProcessTurn && !isRealTimeMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Process Turn
        </button>
        
        <button
          onClick={resetSimulation}
          disabled={isRealTimeMode}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isRealTimeMode
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</header>
```

**Updated Dashboard View**:
```javascript
// Add real-time performance dashboard to the overview
const DashboardView = ({ worldState, turnManager, currentTurn }) => {
  const { isRealTimeMode } = useSimulationContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-900 dark:text-gray-100">
      {/* NEW: Real-Time Performance Dashboard */}
      {isRealTimeMode && (
        <div className="lg:col-span-3">
          <RealTimePerformanceDashboard />
        </div>
      )}

      {/* NEW: Speed Control Panel */}
      {isRealTimeMode && (
        <div className="lg:col-span-3">
          <SpeedControlPanel />
        </div>
      )}

      {/* Existing Statistics Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ... existing stat cards ... */}
      </div>

      {/* Existing NPC Activity Panel */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* ... existing NPC activity content ... */}
      </div>

      {/* Existing Recent Events Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* ... existing events content ... */}
      </div>
    </div>
  );
};
```

### 3. No Changes Required to Existing Services

**Important**: The following components require **NO modifications**:

- **SimulationService**: `processTurn()` continues to work identically
- **LODManager**: Pre-turn and post-turn LOD processing unchanged
- **BehavioralStateService**: WASM consciousness calculations unchanged
- **TurnManager**: Turn coordination logic unchanged
- **LocalStorageWorldRepository**: State persistence unchanged

Real-time mode is purely a **control mechanism** that automates calling `processTurn()`. All existing simulation logic remains untouched.


## Data Models

### Real-Time Metrics
```typescript
interface RealTimeMetrics {
  actualTPS: number;           // Measured turns per second
  targetTPS: number;           // Desired turns per second
  averageTurnTime: number;     // Average ms per turn (last 10)
  turnTimeHistory: number[];   // Last 10 turn processing times
  totalTurnsProcessed: number; // Total turns since real-time started
  startTime: number;           // Timestamp when real-time started
  lastTurnTime: number;        // Timestamp of last turn completion
}
```

### Performance Thresholds
```typescript
interface PerformanceThresholds {
  optimal: number;    // >30 TPS (green)
  acceptable: number; // 15-30 TPS (yellow)
  poor: number;       // <15 TPS (red)
}

const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  optimal: 30,
  acceptable: 15,
  poor: 0
};
```

### Speed Presets
```typescript
const SPEED_PRESETS = [
  { label: '1x', value: 1 },   // 1 turn per second
  { label: '2x', value: 2 },   // 2 turns per second
  { label: '5x', value: 5 },   // 5 turns per second
  { label: '10x', value: 10 }, // 10 turns per second
  { label: '25x', value: 25 }  // 25 turns per second
];

const CUSTOM_SPEED_RANGE = {
  min: 0.1,  // Minimum 0.1 TPS (10 seconds per turn)
  max: 50,   // Maximum 50 TPS (20ms per turn)
  step: 0.1  // 0.1 TPS increments
};
```

## Error Handling

### Error Handling Strategy

1. **Turn Processing Errors**
   - Catch errors in `setInterval` callback
   - Log error details to console
   - Stop real-time mode automatically
   - Display error notification to user
   - Preserve last valid world state

2. **Performance Degradation**
   - Monitor actual TPS vs target TPS
   - Display warning when actual < 80% of target
   - Suggest reducing speed or NPC count
   - Continue processing (don't stop automatically)

3. **State Corruption**
   - Validate world state after each turn
   - If corruption detected, stop real-time mode
   - Offer to restore from last checkpoint
   - Log detailed error information

4. **Browser Tab Visibility**
   - Detect when tab becomes hidden
   - Optionally pause real-time mode
   - Resume when tab becomes visible again
   - Prevent background throttling issues

### Error Recovery Flow

```
Turn Processing Error
         ↓
Catch in setInterval callback
         ↓
Log error details
         ↓
clearInterval(realTimeIntervalId)
         ↓
setIsRealTimeMode(false)
         ↓
Display error notification
         ↓
Preserve currentSimulationState
         ↓
User can review error and retry
```

## Testing Strategy

### Unit Tests

1. **SimulationContext Real-Time Functions**
   - Test `startRealTimeMode()` creates interval
   - Test `stopRealTimeMode()` clears interval
   - Test `adjustRealTimeSpeed()` updates interval
   - Test metrics calculation accuracy
   - Test error handling stops real-time mode

2. **UI Component Tests**
   - Test ModeToggleControl enables/disables correctly
   - Test SpeedControlPanel updates speed
   - Test RealTimePerformanceDashboard displays metrics
   - Test performance warnings appear at thresholds

### Integration Tests

1. **End-to-End Real-Time Simulation**
   - Start real-time mode at 1 TPS
   - Verify turns process automatically
   - Verify metrics update correctly
   - Stop real-time mode
   - Verify state is preserved

2. **Mode Switching**
   - Start in turn-based mode
   - Switch to real-time mode
   - Process several turns
   - Switch back to turn-based mode
   - Verify no data loss

3. **Performance Under Load**
   - Start real-time mode with 100+ NPCs
   - Run at 10 TPS for 100 turns
   - Verify LOD processing works correctly
   - Verify WASM acceleration is used
   - Measure actual vs target TPS

### Performance Benchmarks

| Scenario | NPCs | Target TPS | Expected Actual TPS | Notes |
|----------|------|------------|---------------------|-------|
| Small world | 50 | 10 | 10 | Should maintain target |
| Medium world | 200 | 10 | 9-10 | Slight degradation acceptable |
| Large world | 500 | 10 | 7-9 | LOD should help maintain speed |
| Stress test | 1000 | 10 | 5-7 | Performance warning expected |


## Performance Considerations

### Optimization Strategies

1. **Interval Management**
   - Use `setInterval` for consistent timing
   - Clear interval immediately on stop
   - Avoid creating multiple intervals
   - Monitor for interval drift

2. **Metrics Calculation**
   - Calculate metrics after turn completion
   - Use sliding window for averages (last 10 turns)
   - Avoid expensive calculations in hot path
   - Update UI efficiently with React state

3. **Memory Management**
   - Limit turn history to last 100 turns
   - Prune old performance metrics
   - Use existing LOD memory management
   - Monitor for memory leaks in long runs

4. **UI Updates**
   - Batch state updates where possible
   - Use React.memo for performance components
   - Avoid unnecessary re-renders
   - Throttle chart updates if needed

### Performance Targets

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| TPS at 1x speed | 1.0 | 0.9-1.0 | <0.9 |
| TPS at 10x speed | 10.0 | 8.0-10.0 | <8.0 |
| Turn processing time (50 NPCs) | <50ms | 50-100ms | >100ms |
| Turn processing time (200 NPCs) | <100ms | 100-200ms | >200ms |
| Turn processing time (500 NPCs) | <200ms | 200-400ms | >400ms |
| UI responsiveness | <16ms | 16-33ms | >33ms |

## Migration Path

### Phase 1: SimulationContext Enhancement (Day 1)
- Add real-time state variables
- Implement `startRealTimeMode()`
- Implement `stopRealTimeMode()`
- Implement `adjustRealTimeSpeed()`
- Add metrics tracking
- Update context value
- Write unit tests

### Phase 2: UI Components (Day 2)
- Create ModeToggleControl component
- Create SpeedControlPanel component
- Create RealTimePerformanceDashboard component
- Update WorldHistorySimInterface header
- Update dashboard view layout
- Add performance warnings
- Write component tests

### Phase 3: Integration Testing (Day 3)
- Test mode switching
- Test speed adjustments
- Test with various NPC counts
- Test LOD integration
- Test WASM integration
- Test error handling
- Performance benchmarking

### Phase 4: Polish & Documentation (Day 4)
- Add keyboard shortcuts (space to toggle, +/- for speed)
- Add accessibility features
- Update user documentation
- Create demo video
- Add marketing materials
- Final testing

## Backward Compatibility

### Compatibility Guarantees

1. **No Breaking Changes**
   - All existing turn-based functionality unchanged
   - `processTurn()` API unchanged
   - SimulationService unchanged
   - LODManager unchanged
   - State persistence unchanged

2. **Opt-In Feature**
   - Real-time mode is optional
   - Default mode is turn-based
   - Users can ignore real-time features
   - No impact on existing workflows

3. **State Compatibility**
   - Real-time mode uses same world state
   - Save files work identically
   - Turn history format unchanged
   - No new required fields

### Migration for Existing Users

**No migration required** - Real-time mode is a pure addition that doesn't affect existing functionality. Users can continue using turn-based mode exactly as before.

## Deployment Considerations

### Browser Compatibility

- **Chrome/Edge**: Full support (setInterval, performance.now())
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Supported but may have performance limitations

### Performance Monitoring

1. **Client-Side Metrics**
   - Track actual vs target TPS
   - Monitor turn processing times
   - Log performance warnings
   - Track error frequency

2. **User Feedback**
   - Collect performance reports
   - Monitor common speed settings
   - Track error patterns
   - Gather usability feedback

### Rollout Strategy

1. **Beta Release**
   - Enable for opt-in beta testers
   - Gather performance data
   - Collect user feedback
   - Fix critical issues

2. **Gradual Rollout**
   - Enable for 10% of users
   - Monitor performance metrics
   - Increase to 50% if stable
   - Full release after validation

3. **Feature Flags**
   - Add feature flag for real-time mode
   - Allow disabling if issues found
   - Easy rollback mechanism
   - A/B testing capability

## Conclusion

This design provides a comprehensive real-time simulation mode that:

- **Integrates seamlessly** with existing turn-based architecture
- **Requires no changes** to core simulation services
- **Maintains full compatibility** with existing functionality
- **Showcases WASM performance** effectively to potential customers
- **Provides excellent UX** with intuitive controls and live metrics

The real-time mode is implemented as a **control layer** that automates turn processing while preserving all existing simulation logic, making it a low-risk, high-value addition to the World History Simulation Engine.

