# API Reference - Consciousness Engine WASM

**Version**: 0.1.0  
**Date**: October 18, 2025  
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [JavaScript Wrapper API](#javascript-wrapper-api)
3. [WASM Module Functions](#wasm-module-functions)
4. [Type Definitions](#type-definitions)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Overview

The Consciousness Engine WASM provides two levels of API access:

1. **JavaScript Wrapper** (`ConsciousnessEngineWasm`) - **Recommended for most users**
   - High-level API with automatic fallback
   - Input validation and error handling
   - Performance monitoring
   - Backward compatibility

2. **Direct WASM Module** - **Advanced users only**
   - Direct access to Rust functions
   - Requires manual initialization
   - Maximum performance
   - Lower-level control

### Quick Start

```javascript
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';

const engine = new ConsciousnessEngineWasm();
await engine.initialize();

const behavioral = engine.calculateBehavioralState({
    baseFrequency: 7.5,
    baseCoherence: 0.7,
    emotionalState: 'Content'
});
```

---

## JavaScript Wrapper API

### Class: ConsciousnessEngineWasm

#### Constructor

##### `new ConsciousnessEngineWasm(options?)`

Creates a new instance of the consciousness engine wrapper.

**Parameters:**
- `options` (Object, optional):
  - `autoInitialize` (Boolean): Automatically initialize on construction (default: false)
  - `fallbackToJs` (Boolean): Use JavaScript fallback if WASM fails (default: true)
  - `performanceTracking` (Boolean): Track performance metrics (default: true)

**Returns:** ConsciousnessEngineWasm instance

**Example:**
```javascript
// Default configuration
const engine = new ConsciousnessEngineWasm();

// Custom configuration
const engine = new ConsciousnessEngineWasm({
    autoInitialize: false,
    fallbackToJs: true,
    performanceTracking: true
});
```

---

### Initialization Methods

#### `async initialize(): Promise<boolean>`

Initialize the WASM module. Must be called before using any calculation methods.

**Returns:** 
- `true` - WASM successfully initialized
- `false` - WASM initialization failed, using JavaScript fallback

**Example:**
```javascript
const engine = new ConsciousnessEngineWasm();
const wasmReady = await engine.initialize();

if (wasmReady) {
    console.log('✅ WASM acceleration enabled');
} else {
    console.log('⚠️  Using JavaScript fallback (still functional)');
}
```

**Errors:**
- None - Always returns boolean, never throws

**Notes:**
- Call only once per instance
- Safe to call multiple times (idempotent)
- Automatically tracks initialization status

---

#### `isInitialized(): boolean`

Check if the engine has been initialized.

**Returns:** `true` if initialized, `false` otherwise

**Example:**
```javascript
if (!engine.isInitialized()) {
    await engine.initialize();
}

const result = engine.calculateBehavioralState(state);
```

---

#### `isUsingWasm(): boolean`

Check if the engine is using WASM backend (vs JavaScript fallback).

**Returns:** `true` if using WASM, `false` if using JavaScript fallback

**Example:**
```javascript
await engine.initialize();

if (engine.isUsingWasm()) {
    console.log('High-performance WASM enabled');
} else {
    console.log('Running in JavaScript mode');
}
```

---

### Core Calculation Methods

#### `calculateBehavioralState(consciousnessState): BehavioralState`

Calculate behavioral state for a single character from consciousness parameters.

**Parameters:**
- `consciousnessState` (Object):
  - `baseFrequency` (Number, **required**): Base consciousness frequency (3-15 Hz recommended)
  - `baseCoherence` (Number, **required**): Base consciousness coherence (0.2-1.0)
  - `emotionalState` (String, optional): Current emotional state (default: 'Content')
  - `currentFrequency` (Number, optional): Current frequency override
  - `emotionalCoherence` (Number, optional): Emotional coherence override
  - `lastUpdate` (Number, optional): Timestamp of last update

**Returns:** BehavioralState object:
```javascript
{
    energy: String,           // 'Low' | 'Moderate' | 'High'
    energyLevel: String,      // Same as energy (compatibility)
    focus: String,            // 'Scattered' | 'Balanced' | 'Focused'
    focusLevel: String,       // Same as focus (compatibility)
    mood: String,             // 'Depressed' | 'Content' | 'Optimistic' | 'Excited'
    emotionalState: String,   // Same as mood (compatibility)
    socialDrive: Number,      // 0.0-1.0
    riskTolerance: Number,    // 0.0-1.0
    ambition: Number,         // 0.0-1.0
    cachedTimestamp: Number   // Timestamp of calculation
}
```

**Performance:** ~0.007ms per calculation (WASM), ~0.015ms (JavaScript)

**Example:**
```javascript
const character = {
    consciousness: {
        baseFrequency: 7.5,
        baseCoherence: 0.7,
        emotionalState: 'Content'
    }
};

const behavioral = engine.calculateBehavioralState(
    character.consciousness
);

console.log(behavioral.energy);      // 'Moderate'
console.log(behavioral.mood);        // 'Content'
console.log(behavioral.ambition);    // 0.525
console.log(behavioral.socialDrive); // 0.4375
```

**Errors:**
- Returns JavaScript fallback result on WASM failure
- Invalid inputs are clamped to valid ranges
- Missing required fields throw TypeError

**Notes:**
- Automatically validates and clamps frequency/coherence
- Supports dual naming conventions (energy/energyLevel, etc.)
- Results are deterministic (same input → same output)

---

#### `calculateBatchBehavioralStates(consciousnessStates): BehavioralState[]`

Optimized batch processing for multiple characters. **10x faster** than individual calls.

**Parameters:**
- `consciousnessStates` (Array): Array of consciousness state objects (same format as single calculation)

**Returns:** Array of BehavioralState objects (same format as single calculation)

**Performance:** 
- 100 characters: ~0.08ms (WASM), ~1.5ms (JavaScript)
- 1,000 characters: ~0.29ms (WASM), ~15ms (JavaScript)
- 10,000 characters: ~4.4ms (WASM), ~150ms (JavaScript)

**Example:**
```javascript
// LOD population group (100 characters)
const populationGroup = world.settlements[0].populationGroups[0];

const consciousnessStates = populationGroup.characters.map(char => ({
    baseFrequency: char.consciousness.baseFrequency,
    baseCoherence: char.consciousness.baseCoherence,
    emotionalState: char.consciousness.emotionalState
}));

const behaviors = engine.calculateBatchBehavioralStates(
    consciousnessStates
);

// Apply results back to characters
populationGroup.characters.forEach((char, i) => {
    char.consciousness.behavioralState = behaviors[i];
});

console.log(`Processed ${behaviors.length} characters`);
```

**Errors:**
- Returns JavaScript fallback on WASM failure
- Invalid array entries are handled individually
- Empty array returns empty array

**Notes:**
- **Use for 10+ characters** for maximum performance benefit
- Maintains determinism across all batch sizes
- Memory efficient (no intermediate allocations)

---

### Emotional System Methods

#### `calculateEmotionalCoherence(frequency, baseCoherence): number`

Calculate emotional coherence from consciousness parameters.

**Parameters:**
- `frequency` (Number): Current consciousness frequency (0.5-100 Hz, clamped)
- `baseCoherence` (Number): Base consciousness coherence (0-1, clamped)

**Returns:** Emotional coherence value (0-1)

**Formula:**
```
emotionalCoherence = min(1.0, baseCoherence * (1 + log10(frequency + 1) / 2))
```

**Example:**
```javascript
const freq = 7.5;
const baseCoh = 0.7;
const emotionalCoh = engine.calculateEmotionalCoherence(freq, baseCoh);
console.log(emotionalCoh); // ~0.766
```

---

#### `determineEmotionalState(coherence, impactMagnitude): string`

Determine emotional state from coherence and impact.

**Parameters:**
- `coherence` (Number): Emotional coherence (0-1, clamped)
- `impactMagnitude` (Number): Emotional impact magnitude (-1 to 1, clamped)

**Returns:** EmotionalState string:
- `'Content'` - Neutral, balanced state
- `'Excited'` - High positive energy
- `'Joyful'` - Peak positive state
- `'Anxious'` - Low coherence, negative
- `'Depressed'` - Very low coherence, negative
- `'Angry'` - High energy, negative
- `'Fearful'` - Low coherence, high threat
- `'Surprised'` - Sudden change detected

**Example:**
```javascript
const state = engine.determineEmotionalState(0.7, 0.5);
console.log(state); // 'Excited'

const depressed = engine.determineEmotionalState(0.3, -0.8);
console.log(depressed); // 'Depressed'
```

---

#### `applyEmotionalImpact(consciousnessState, emotionalImpact): ConsciousnessState`

Apply an emotional impact to a consciousness state.

**Parameters:**
- `consciousnessState` (Object): Current consciousness state
- `emotionalImpact` (Object):
  - `magnitude` (Number): Impact strength (-1 to 1)
  - `valence` (Number): Positive/negative (-1 to 1)
  - `type` (String, optional): Impact type identifier

**Returns:** Updated ConsciousnessState object with new emotional state

**Example:**
```javascript
const character = {
    consciousness: {
        baseFrequency: 7.5,
        baseCoherence: 0.7,
        emotionalState: 'Content'
    }
};

const impact = {
    magnitude: 0.8,
    valence: 0.9,
    type: 'positive_interaction'
};

const newState = engine.applyEmotionalImpact(
    character.consciousness,
    impact
);

console.log(newState.emotionalState); // 'Excited' or 'Joyful'
```

---

### Configuration Methods

#### `getDefaultConfiguration(): Object`

Get the default consciousness configuration with parameter bounds.

**Returns:** Configuration object:
```javascript
{
    bounds: {
        frequency: {
            min: 3.0,
            max: 15.0,
            default: 7.5,
            description: 'Consciousness frequency in Hz (3-15 range)'
        },
        coherence: {
            min: 0.2,
            max: 1.0,
            default: 0.7,
            description: 'Consciousness coherence (0.2-1.0 range)'
        }
    }
}
```

**Example:**
```javascript
const config = engine.getDefaultConfiguration();
console.log(config.bounds.frequency.default); // 7.5
console.log(config.bounds.coherence.min);     // 0.2
```

---

#### `getConfiguration(): Object`

Get the current engine configuration.

**Returns:** Current configuration object (same format as default)

**Example:**
```javascript
const currentConfig = engine.getConfiguration();
console.log('Current bounds:', currentConfig.bounds);
```

---

#### `setConfiguration(config): boolean`

Set a custom consciousness configuration.

**Parameters:**
- `config` (Object): Configuration object (same format as default)

**Returns:** `true` if configuration is valid and applied, `false` otherwise

**Example:**
```javascript
const customConfig = {
    bounds: {
        frequency: {
            min: 2.0,      // Allow lower frequencies
            max: 20.0,     // Allow higher frequencies
            default: 8.0
        },
        coherence: {
            min: 0.1,      // Allow lower coherence
            max: 1.0,
            default: 0.75
        }
    }
};

const success = engine.setConfiguration(customConfig);
if (success) {
    console.log('✅ Custom configuration applied');
}
```

**Notes:**
- Configuration is validated before application
- Invalid configuration leaves existing config unchanged
- Affects all subsequent calculations

---

#### `validateConfiguration(config): boolean`

Validate a configuration object without applying it.

**Parameters:**
- `config` (Object): Configuration to validate

**Returns:** `true` if valid, `false` otherwise

**Example:**
```javascript
const config = {
    bounds: {
        frequency: { min: 3.0, max: 15.0, default: 7.5 },
        coherence: { min: 0.2, max: 1.0, default: 0.7 }
    }
};

if (engine.validateConfiguration(config)) {
    engine.setConfiguration(config);
}
```

---

### Performance Methods

#### `getPerformanceStats(): Object`

Get performance metrics for monitoring and optimization.

**Returns:** Performance statistics object:
```javascript
{
    wasmCalls: Number,         // Total WASM function calls
    fallbackCalls: Number,     // Total JavaScript fallback calls
    totalTime: Number,         // Total computation time (ms)
    averageTime: Number,       // Average operation time (ms)
    wasmEnabled: Boolean,      // Whether WASM is active
    module: String             // 'WASM' or 'JavaScript'
}
```

**Example:**
```javascript
// Process 10,000 characters
for (let i = 0; i < 10000; i++) {
    engine.calculateBehavioralState(characters[i].consciousness);
}

const stats = engine.getPerformanceStats();
console.log(`Processed ${stats.wasmCalls} calls`);
console.log(`Average time: ${stats.averageTime.toFixed(4)}ms`);
console.log(`Total time: ${stats.totalTime.toFixed(2)}ms`);
console.log(`Throughput: ${(10000 / (stats.totalTime / 1000)).toFixed(0)} chars/sec`);
```

**Notes:**
- Statistics are cumulative since initialization
- Useful for performance monitoring and optimization
- Reset only by creating new engine instance

---

### Utility Methods

#### `validateFrequency(frequency): number`

Validate and clamp frequency to valid range.

**Parameters:**
- `frequency` (Number): Frequency value to validate

**Returns:** Clamped frequency value (0.5-100 Hz)

**Example:**
```javascript
const validated = engine.validateFrequency(150);
console.log(validated); // 100 (clamped to max)

const negative = engine.validateFrequency(-5);
console.log(negative); // 0.5 (clamped to min)
```

---

#### `validateCoherence(coherence): number`

Validate and clamp coherence to valid range.

**Parameters:**
- `coherence` (Number): Coherence value to validate

**Returns:** Clamped coherence value (0-1)

**Example:**
```javascript
const validated = engine.validateCoherence(1.5);
console.log(validated); // 1.0 (clamped to max)

const negative = engine.validateCoherence(-0.2);
console.log(negative); // 0.0 (clamped to min)
```

---

## WASM Module Functions

Direct access to WASM functions. **Advanced users only.** Requires manual initialization.

### Module Information

#### `get_version(): string`

Get the WASM module version.

**Returns:** Version string (e.g., "0.1.0")

**Example:**
```javascript
const wasm = await import('./pkg/consciousness_engine.js');
await wasm.default(); // Initialize
console.log(wasm.get_version()); // "0.1.0"
```

---

#### `get_build_info(): string`

Get build information including Rust version and build date.

**Returns:** Build info string

---

#### `is_wasm_supported(): boolean`

Check if WASM is supported in current environment.

**Returns:** `true` if WASM supported, `false` otherwise

---

### Core Calculations (WASM)

#### `calculate_behavioral_state(consciousness: Object): Object`

Direct WASM behavioral state calculation.

**Note:** Use wrapper's `calculateBehavioralState()` instead for most cases.

---

#### `calculate_batch_behavioral_states(states: Array): Array`

Direct WASM batch processing.

**Note:** Use wrapper's `calculateBatchBehavioralStates()` instead.

---

## Type Definitions

### ConsciousnessState

```typescript
interface ConsciousnessState {
    baseFrequency: number;        // 3-15 Hz (recommended)
    baseCoherence: number;        // 0.2-1.0
    emotionalState?: string;      // EmotionalState enum
    currentFrequency?: number;    // Override frequency
    emotionalCoherence?: number;  // Override coherence
    lastUpdate?: number;          // Timestamp
}
```

---

### BehavioralState

```typescript
interface BehavioralState {
    energy: string;           // 'Low' | 'Moderate' | 'High'
    energyLevel: string;      // Alias for energy
    focus: string;            // 'Scattered' | 'Balanced' | 'Focused'
    focusLevel: string;       // Alias for focus
    mood: string;             // 'Depressed' | 'Content' | 'Optimistic' | 'Excited'
    emotionalState: string;   // Alias for mood
    socialDrive: number;      // 0.0-1.0
    riskTolerance: number;    // 0.0-1.0
    ambition: number;         // 0.0-1.0
    cachedTimestamp: number;  // Calculation timestamp
}
```

---

### EmotionalState (Enum)

Valid values:
- `'Content'` - Default, balanced state
- `'Excited'` - High positive energy
- `'Joyful'` - Peak positive state
- `'Anxious'` - Worried, uncertain
- `'Depressed'` - Low energy, negative
- `'Angry'` - High energy, negative
- `'Fearful'` - Threatened, low coherence
- `'Surprised'` - Sudden change

---

### EmotionalImpact

```typescript
interface EmotionalImpact {
    magnitude: number;  // -1.0 to 1.0 (impact strength)
    valence: number;    // -1.0 to 1.0 (positive/negative)
    type?: string;      // Optional impact identifier
}
```

---

### Configuration

```typescript
interface Configuration {
    bounds: {
        frequency: {
            min: number;
            max: number;
            default: number;
            description?: string;
        };
        coherence: {
            min: number;
            max: number;
            default: number;
            description?: string;
        };
    };
}
```

---

## Error Handling

### Error Strategies

The wrapper provides multiple layers of error handling:

1. **Input Validation** - Invalid inputs are clamped to valid ranges
2. **Graceful Fallback** - WASM failures automatically use JavaScript
3. **Default Values** - Missing optional fields use sensible defaults
4. **Never Throws** - All methods handle errors internally

### Common Error Scenarios

#### WASM Initialization Failed

```javascript
const engine = new ConsciousnessEngineWasm();
const ready = await engine.initialize();

if (!ready) {
    console.log('WASM unavailable, using JavaScript fallback');
    // Engine still works, just slower
}
```

**Solution:** None needed - automatic fallback

---

#### Invalid Frequency/Coherence

```javascript
const behavioral = engine.calculateBehavioralState({
    baseFrequency: 999,  // Will be clamped to 100
    baseCoherence: -5     // Will be clamped to 0
});
// Still returns valid result
```

**Solution:** Automatic clamping to valid ranges

---

#### Missing Required Fields

```javascript
try {
    const behavioral = engine.calculateBehavioralState({
        // Missing baseFrequency and baseCoherence
    });
} catch (error) {
    console.error('Required fields missing:', error);
}
```

**Solution:** Always provide `baseFrequency` and `baseCoherence`

---

#### Invalid Emotional State

```javascript
const behavioral = engine.calculateBehavioralState({
    baseFrequency: 7.5,
    baseCoherence: 0.7,
    emotionalState: 'InvalidState'  // Not a valid enum value
});
// Falls back to 'Content'
```

**Solution:** Use valid EmotionalState enum values

---

## Examples

### Example 1: Basic Single Character

```javascript
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';

const engine = new ConsciousnessEngineWasm();
await engine.initialize();

const character = {
    name: 'Aldric',
    consciousness: {
        baseFrequency: 8.5,
        baseCoherence: 0.8,
        emotionalState: 'Content'
    }
};

const behavioral = engine.calculateBehavioralState(
    character.consciousness
);

console.log(`${character.name}'s state:`);
console.log(`- Energy: ${behavioral.energy}`);
console.log(`- Focus: ${behavioral.focus}`);
console.log(`- Mood: ${behavioral.mood}`);
console.log(`- Social Drive: ${behavioral.socialDrive.toFixed(2)}`);
console.log(`- Risk Tolerance: ${behavioral.riskTolerance.toFixed(2)}`);
console.log(`- Ambition: ${behavioral.ambition.toFixed(2)}`);
```

---

### Example 2: LOD Population Group

```javascript
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';

const engine = new ConsciousnessEngineWasm();
await engine.initialize();

// LOD Tier 3: Population group (100 characters)
const populationGroup = {
    size: 100,
    characters: Array(100).fill(null).map((_, i) => ({
        id: `citizen_${i}`,
        consciousness: {
            baseFrequency: 5.0 + Math.random() * 5,
            baseCoherence: 0.5 + Math.random() * 0.3,
            emotionalState: 'Content'
        }
    }))
};

console.log(`Processing ${populationGroup.size} characters...`);
const start = performance.now();

const consciousnessStates = populationGroup.characters.map(
    char => char.consciousness
);

const behaviors = engine.calculateBatchBehavioralStates(
    consciousnessStates
);

const duration = performance.now() - start;

// Apply results
populationGroup.characters.forEach((char, i) => {
    char.consciousness.behavioralState = behaviors[i];
});

console.log(`✅ Processed in ${duration.toFixed(2)}ms`);
console.log(`Throughput: ${(populationGroup.size / (duration / 1000)).toFixed(0)} chars/sec`);
```

---

### Example 3: Turn-Based Simulation

```javascript
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';

class TurnManager {
    constructor() {
        this.engine = new ConsciousnessEngineWasm();
        this.initialized = false;
    }

    async initialize() {
        this.initialized = await this.engine.initialize();
        return this.initialized;
    }

    async processTurn(world) {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`\n=== Turn ${world.turn} ===`);
        const start = performance.now();

        // Collect all consciousness states
        const allStates = world.characters.map(char => 
            char.consciousness
        );

        // Batch process all characters
        const behaviors = this.engine.calculateBatchBehavioralStates(
            allStates
        );

        // Update characters
        world.characters.forEach((char, i) => {
            char.consciousness.behavioralState = behaviors[i];
        });

        const duration = performance.now() - start;
        console.log(`Processed ${world.characters.length} characters in ${duration.toFixed(2)}ms`);

        world.turn++;
        return behaviors;
    }
}

// Usage
const turnManager = new TurnManager();
await turnManager.initialize();

for (let i = 0; i < 10; i++) {
    await turnManager.processTurn(world);
}
```

---

### Example 4: Performance Monitoring

```javascript
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';

const engine = new ConsciousnessEngineWasm();
await engine.initialize();

// Simulate processing
for (let turn = 0; turn < 100; turn++) {
    const behaviors = engine.calculateBatchBehavioralStates(
        characters.map(c => c.consciousness)
    );
}

// Get performance stats
const stats = engine.getPerformanceStats();

console.log('\n=== Performance Report ===');
console.log(`WASM Enabled: ${stats.wasmEnabled ? '✅' : '❌'}`);
console.log(`Module: ${stats.module}`);
console.log(`Total Calls: ${stats.wasmCalls + stats.fallbackCalls}`);
console.log(`WASM Calls: ${stats.wasmCalls}`);
console.log(`Fallback Calls: ${stats.fallbackCalls}`);
console.log(`Total Time: ${stats.totalTime.toFixed(2)}ms`);
console.log(`Average Time: ${stats.averageTime.toFixed(4)}ms`);

if (stats.wasmEnabled) {
    console.log('✅ High-performance mode active');
} else {
    console.log('⚠️  Running in fallback mode');
}
```

---

### Example 5: Error Handling

```javascript
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';

const engine = new ConsciousnessEngineWasm({ fallbackToJs: true });
const ready = await engine.initialize();

try {
    // Attempt calculation with potentially invalid data
    const behavioral = engine.calculateBehavioralState({
        baseFrequency: userInput.frequency || 7.5,
        baseCoherence: userInput.coherence || 0.7,
        emotionalState: userInput.emotion || 'Content'
    });

    console.log('✅ Calculation succeeded');
    console.log('Result:', behavioral);

} catch (error) {
    console.error('❌ Calculation failed:', error);
    
    // Use default values
    const defaultBehavioral = {
        energy: 'Moderate',
        focus: 'Balanced',
        mood: 'Content',
        socialDrive: 0.5,
        riskTolerance: 0.5,
        ambition: 0.5,
        cachedTimestamp: Date.now()
    };
    
    console.log('Using default behavioral state');
}
```

---

## Best Practices

### 1. Initialize Once

```javascript
// ✅ Good - Initialize at startup
const engine = new ConsciousnessEngineWasm();
await engine.initialize();

// ❌ Bad - Initialize per calculation
for (const char of characters) {
    const engine = new ConsciousnessEngineWasm();
    await engine.initialize();
    const behavioral = engine.calculateBehavioralState(char.consciousness);
}
```

---

### 2. Use Batch Processing

```javascript
// ✅ Good - Batch for 10+ characters
const behaviors = engine.calculateBatchBehavioralStates(
    characters.map(c => c.consciousness)
);

// ❌ Bad - Individual calls in loop
const behaviors = characters.map(char => 
    engine.calculateBehavioralState(char.consciousness)
);
```

---

### 3. Monitor Performance

```javascript
// ✅ Good - Regular monitoring
setInterval(() => {
    const stats = engine.getPerformanceStats();
    if (!stats.wasmEnabled) {
        console.warn('WASM fallback detected');
    }
}, 60000); // Every minute
```

---

### 4. Validate Input

```javascript
// ✅ Good - Validate before calculation
const frequency = engine.validateFrequency(userInput.frequency);
const coherence = engine.validateCoherence(userInput.coherence);

const behavioral = engine.calculateBehavioralState({
    baseFrequency: frequency,
    baseCoherence: coherence
});
```

---

### 5. Handle Fallback Gracefully

```javascript
// ✅ Good - Check backend and adjust
const ready = await engine.initialize();

if (engine.isUsingWasm()) {
    console.log('High-performance mode');
    // Can process thousands of characters
} else {
    console.log('Standard mode');
    // Limit batch sizes or show warning
}
```

---

## Version History

### 0.1.0 (October 18, 2025)
- Initial production release
- 27+ WASM functions exported
- Complete JavaScript wrapper
- TypeScript definitions
- Comprehensive error handling
- Performance monitoring
- Automatic fallback

---

## Support

### Documentation
- [README.md](./README.md) - Project overview
- [INTEGRATION.md](./INTEGRATION.md) - Integration guide
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration from JavaScript
- [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) - Optimization strategies
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

### Examples
- `examples/` - Complete usage examples
- `test-wrapper.js` - API demonstrations
- `integration-demo.js` - Real-world scenarios

---

**Last Updated**: October 18, 2025  
**Version**: 0.1.0  
**Status**: Production Ready ✅
