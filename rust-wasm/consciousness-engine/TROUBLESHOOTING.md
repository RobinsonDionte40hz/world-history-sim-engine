# Troubleshooting Guide - Consciousness Engine WASM

**Version**: 0.1.0  
**Date**: October 18, 2025

---

## Common Issues

### Issue 1: WASM Not Loading

**Symptoms:**
- Console message: "Using JavaScript fallback"
- `isUsingWasm()` returns `false`
- Performance not improved

**Causes & Solutions:**

#### Cause 1: WASM File Not Found
```javascript
// Error: Cannot find module './pkg/consciousness_engine_bg.wasm'
```

**Solution:**
```bash
# Verify WASM files exist
ls rust-wasm/consciousness-engine/pkg/

# Should see:
# - consciousness_engine.js
# - consciousness_engine_bg.wasm
# - consciousness_engine.d.ts

# If missing, rebuild:
cd rust-wasm/consciousness-engine
wasm-pack build --target nodejs
```

#### Cause 2: Wrong Import Path
```javascript
// ❌ Incorrect path
import wasm from '../wrong/path/consciousness_engine.js';

// ✅ Correct path (adjust to your project structure)
import wasm from './wasm/consciousness/consciousness_engine.js';
```

#### Cause 3: Node.js Version Too Old
```bash
# Check version
node --version

# Needs Node.js 20+ for WASM support
# Update if needed:
nvm install 20
nvm use 20
```

#### Cause 4: Browser Doesn't Support WASM
```javascript
// Check WASM support
if (typeof WebAssembly === 'undefined') {
    console.error('❌ WebAssembly not supported');
} else {
    console.log('✅ WebAssembly supported');
}
```

**Solution:** Use modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

---

### Issue 2: Type Errors / Serialization Failures

**Symptoms:**
```
Error: unknown variant `Happy`, expected one of `Content`, `Excited`, ...
```

**Cause:** Invalid EmotionalState value

**Solution:**
```javascript
// ❌ Invalid emotional state
const behavioral = wasmEngine.calculateBehavioralState({
    baseFrequency: 7.5,
    baseCoherence: 0.7,
    emotionalState: 'Happy'  // Not a valid enum value
});

// ✅ Use valid enum values
const VALID_STATES = [
    'Content', 'Excited', 'Joyful', 'Anxious',
    'Depressed', 'Angry', 'Fearful', 'Surprised'
];

const behavioral = wasmEngine.calculateBehavioralState({
    baseFrequency: 7.5,
    baseCoherence: 0.7,
    emotionalState: 'Content'
});
```

---

### Issue 3: Incorrect Results

**Symptoms:**
- Behavioral state values seem wrong
- Inconsistent with JavaScript implementation
- NaN or undefined values

**Debugging Steps:**

#### Step 1: Verify Input Values
```javascript
const state = {
    baseFrequency: character.consciousness.baseFrequency,
    baseCoherence: character.consciousness.baseCoherence,
    emotionalState: character.consciousness.emotionalState
};

console.log('Input:', state);

// Check for invalid values
if (isNaN(state.baseFrequency) || isNaN(state.baseCoherence)) {
    console.error('❌ Invalid input values:', state);
}

const behavioral = wasmEngine.calculateBehavioralState(state);
console.log('Output:', behavioral);
```

#### Step 2: Check Frequency/Coherence Ranges
```javascript
// Validate ranges
const validatedFreq = wasmEngine.validateFrequency(state.baseFrequency);
const validatedCoh = wasmEngine.validateCoherence(state.baseCoherence);

console.log('Validated frequency:', validatedFreq);  // Should be 0.5-100
console.log('Validated coherence:', validatedCoh);   // Should be 0-1
```

#### Step 3: Compare with JavaScript Implementation
```javascript
// Calculate with both implementations
const wasmResult = wasmEngine.calculateBehavioralState(state);
const jsResult = yourJavaScriptImplementation(state);

console.log('WASM:', wasmResult);
console.log('JS:', jsResult);

// Check differences
const energyMatch = wasmResult.energy === jsResult.energy;
const moodMatch = wasmResult.mood === jsResult.mood;

console.log('Energy match:', energyMatch);
console.log('Mood match:', moodMatch);
```

---

### Issue 4: Performance Not Improved

**Symptoms:**
- WASM seems active but performance similar to JavaScript
- No speedup observed

**Diagnosis:**

#### Check 1: Verify WASM is Actually Running
```javascript
const stats = wasmEngine.getPerformanceStats();
console.log('WASM enabled:', stats.wasmEnabled);
console.log('Module:', stats.module);
console.log('WASM calls:', stats.wasmCalls);
console.log('Fallback calls:', stats.fallbackCalls);

if (stats.fallbackCalls > 0 && stats.wasmCalls === 0) {
    console.error('❌ WASM not being used!');
}
```

#### Check 2: Use Batch Processing
```javascript
// ❌ Bad - Individual calls (slow even with WASM)
for (const char of characters) {
    char.consciousness.behavioralState = 
        wasmEngine.calculateBehavioralState(char.consciousness);
}

// ✅ Good - Batch processing (10x faster)
const behaviors = wasmEngine.calculateBatchBehavioralStates(
    characters.map(c => c.consciousness)
);
```

#### Check 3: Benchmark Properly
```javascript
// ❌ Bad - Includes setup time
const start = performance.now();
const engine = new ConsciousnessEngineWasm();
await engine.initialize();
const behaviors = engine.calculateBatchBehavioralStates(states);
const duration = performance.now() - start;

// ✅ Good - Only measure calculation
await engine.initialize();  // Do this once

const start = performance.now();
const behaviors = engine.calculateBatchBehavioralStates(states);
const duration = performance.now() - start;
```

---

### Issue 5: Memory Leaks

**Symptoms:**
- Memory usage grows over time
- Application slows down after many turns
- Browser/Node.js crashes after extended use

**Diagnosis:**

#### Step 1: Profile Memory
```javascript
// Run with: node --expose-gc your-script.js
if (global.gc) {
    global.gc();
}

const memBefore = process.memoryUsage().heapUsed;

// Run simulation
for (let i = 0; i < 1000; i++) {
    const behaviors = wasmEngine.calculateBatchBehavioralStates(characters.map(c => c.consciousness));
}

if (global.gc) {
    global.gc();
}

const memAfter = process.memoryUsage().heapUsed;
const growth = (memAfter - memBefore) / 1024 / 1024;

console.log(`Memory growth: ${growth.toFixed(2)} MB`);

if (growth > 10) {
    console.error('❌ Possible memory leak detected');
}
```

#### Step 2: Check for Retained References
```javascript
// ❌ Bad - Keeping unnecessary references
this.behaviorHistory = [];

function processTurn() {
    const behaviors = wasmEngine.calculateBatchBehavioralStates(/*...*/);
    this.behaviorHistory.push(behaviors);  // Grows forever!
}

// ✅ Good - Clear old data
function processTurn() {
    const behaviors = wasmEngine.calculateBatchBehavioralStates(/*...*/);
    
    // Apply immediately
    characters.forEach((char, i) => {
        char.consciousness.behavioralState = behaviors[i];
    });
    
    // Clear reference (allow GC)
    behaviors.length = 0;
}
```

---

### Issue 6: Initialization Errors

**Symptoms:**
```
Error: Cannot read properties of undefined (reading 'default')
```

**Cause:** WASM module not loaded correctly

**Solution:**
```javascript
// ❌ Wrong initialization
const wasm = await import('./pkg/consciousness_engine.js');
const result = wasm.get_version();  // Error!

// ✅ Correct initialization (Node.js)
const wasmModule = await import('./pkg/consciousness_engine.js');
const wasm = await wasmModule.default();  // Must call default()
const result = wasm.get_version();  // Works!

// ✅ Better - Use wrapper (handles initialization)
const engine = new ConsciousnessEngineWasm();
await engine.initialize();
const result = engine.wasmModule.get_version();
```

---

### Issue 7: Determinism Issues

**Symptoms:**
- Same input produces different outputs
- Tests fail intermittently
- Results vary across platforms

**Diagnosis:**

#### Check 1: Verify Determinism
```javascript
const testState = {
    baseFrequency: 7.5,
    baseCoherence: 0.7,
    emotionalState: 'Content'
};

const results = [];
for (let i = 0; i < 100; i++) {
    const behavioral = wasmEngine.calculateBehavioralState(testState);
    results.push(behavioral);
}

// Check all results are identical
const first = JSON.stringify(results[0]);
const allSame = results.every(r => JSON.stringify(r) === first);

console.log('Deterministic:', allSame ? '✅' : '❌');

if (!allSame) {
    console.error('❌ Non-deterministic results detected');
    console.log('First:', results[0]);
    console.log('Different:', results.find(r => JSON.stringify(r) !== first));
}
```

#### Check 2: Verify Timestamp Handling
```javascript
// Timestamps will differ - exclude from comparison
function compareBehavioral(a, b) {
    const aWithoutTimestamp = { ...a };
    const bWithoutTimestamp = { ...b };
    delete aWithoutTimestamp.cachedTimestamp;
    delete bWithoutTimestamp.cachedTimestamp;
    
    return JSON.stringify(aWithoutTimestamp) === JSON.stringify(bWithoutTimestamp);
}
```

---

## Debugging Techniques

### Enable Debug Logging

```javascript
// Add to wrapper
class ConsciousnessEngineWasm {
    constructor(options = {}) {
        this.debug = options.debug || false;
        // ...
    }
    
    calculateBehavioralState(state) {
        if (this.debug) {
            console.log('[WASM Debug] Input:', state);
        }
        
        try {
            const result = this.wasmModule.calculate_behavioral_state(state);
            
            if (this.debug) {
                console.log('[WASM Debug] Output:', result);
            }
            
            return result;
        } catch (error) {
            if (this.debug) {
                console.error('[WASM Debug] Error:', error);
            }
            throw error;
        }
    }
}

// Usage
const engine = new ConsciousnessEngineWasm({ debug: true });
```

---

### Validate Configuration

```javascript
function validateEngineSetup() {
    const checks = [];
    
    // 1. Check WASM file exists
    try {
        await import('./pkg/consciousness_engine.js');
        checks.push({ name: 'WASM file', status: '✅' });
    } catch (error) {
        checks.push({ name: 'WASM file', status: '❌', error });
    }
    
    // 2. Check initialization
    try {
        const engine = new ConsciousnessEngineWasm();
        const ready = await engine.initialize();
        checks.push({ name: 'Initialization', status: ready ? '✅' : '⚠️' });
    } catch (error) {
        checks.push({ name: 'Initialization', status: '❌', error });
    }
    
    // 3. Check basic calculation
    try {
        const result = wasmEngine.calculateBehavioralState({
            baseFrequency: 7.5,
            baseCoherence: 0.7,
            emotionalState: 'Content'
        });
        checks.push({ name: 'Basic calculation', status: '✅' });
    } catch (error) {
        checks.push({ name: 'Basic calculation', status: '❌', error });
    }
    
    // 4. Check batch processing
    try {
        const results = wasmEngine.calculateBatchBehavioralStates([
            { baseFrequency: 7.5, baseCoherence: 0.7 }
        ]);
        checks.push({ name: 'Batch processing', status: '✅' });
    } catch (error) {
        checks.push({ name: 'Batch processing', status: '❌', error });
    }
    
    console.table(checks);
    return checks.every(c => c.status === '✅');
}
```

---

### Compare with JavaScript Implementation

```javascript
function compareImplementations(state) {
    // Calculate with both
    const wasmResult = wasmEngine.calculateBehavioralState(state);
    const jsResult = yourJsImplementation(state);
    
    // Compare fields
    const comparison = {
        energy: { wasm: wasmResult.energy, js: jsResult.energy, match: wasmResult.energy === jsResult.energy },
        focus: { wasm: wasmResult.focus, js: jsResult.focus, match: wasmResult.focus === jsResult.focus },
        mood: { wasm: wasmResult.mood, js: jsResult.mood, match: wasmResult.mood === jsResult.mood },
        socialDrive: { 
            wasm: wasmResult.socialDrive, 
            js: jsResult.socialDrive, 
            match: Math.abs(wasmResult.socialDrive - jsResult.socialDrive) < 0.001 
        },
        // ... other fields
    };
    
    console.table(comparison);
    return Object.values(comparison).every(c => c.match);
}
```

---

## Error Messages Reference

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `unknown variant` | Invalid enum value | Use valid EmotionalState |
| `Cannot find module` | Wrong import path | Fix WASM file path |
| `undefined reading 'default'` | Missing initialization | Call `await wasmModule.default()` |
| `NaN in calculation` | Invalid input values | Validate frequency/coherence |
| `Memory access out of bounds` | WASM internal error | Rebuild WASM module |
| `Failed to compile` | Browser WASM disabled | Enable WASM in browser settings |

---

## Getting Help

### Before Reporting Issues

1. ✅ Check this troubleshooting guide
2. ✅ Run validation script
3. ✅ Check console for errors
4. ✅ Verify WASM files exist
5. ✅ Test with minimal example
6. ✅ Check Node.js/browser version

### Information to Include

When reporting issues, include:

```javascript
// System information
const diagnostics = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    wasmEnabled: wasmEngine.isUsingWasm(),
    wasmModule: wasmEngine.wasmModule ? 'loaded' : 'not loaded',
    stats: wasmEngine.getPerformanceStats(),
    error: 'your error message here'
};

console.log(JSON.stringify(diagnostics, null, 2));
```

---

## Quick Fixes

### Quick Fix 1: Force Fallback

If WASM is causing issues, force JavaScript fallback:

```javascript
// Temporarily disable WASM
const engine = new ConsciousnessEngineWasm({ fallbackToJs: true });
// Don't call initialize()

// Engine still works, just uses JavaScript
const behavioral = engine.calculateBehavioralState(state);
```

### Quick Fix 2: Clear Cache

```bash
# Clear Node.js cache
rm -rf node_modules/.cache

# Rebuild WASM
cd rust-wasm/consciousness-engine
wasm-pack build --target nodejs

# Restart application
```

### Quick Fix 3: Reinstall

```bash
# Clean rebuild
cd rust-wasm/consciousness-engine
cargo clean
wasm-pack build --target nodejs --release

# Copy to project
cp -r pkg/* ../../sim-engine/src/wasm/consciousness/
```

---

**Last Updated**: October 18, 2025  
**Version**: 0.1.0  
**Status**: Production Ready ✅
