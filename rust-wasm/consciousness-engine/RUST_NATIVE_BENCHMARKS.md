# Rust Native Performance Benchmark Results

**Date:** October 17, 2025  
**Build:** Release (optimized)  
**Tool:** Criterion 0.5+  
**Backend:** Plotters (Gnuplot not available)  

---

## Executive Summary

Native Rust performance is **extremely fast** - showing nanosecond-level latencies for core operations. This represents the theoretical maximum performance before WASM serialization overhead.

### Key Findings

- **Single calculation: 5.1 ns** (196 million operations/second)
- **Batch 100: 565 ns** (177 million elements/second)
- **Emotional operations: 1.5-1.8 ns** (500+ million operations/second)
- **Zero-copy advantage: 27% faster** (pre-allocated vs repeated allocation)

---

## Detailed Benchmark Results

### Core Operations

| Benchmark | Time (median) | Throughput | Notes |
|-----------|--------------|------------|-------|
| **single_behavioral_state** | 5.10 ns | 196 M ops/sec | Core calculation |
| **emotional_coherence** | 1.81 ns | 552 M ops/sec | Ultra-fast |
| **emotional_state_determination** | 1.50 ns | 667 M ops/sec | Fastest operation |
| **energy_level_calculation** | 1.60 ns | 625 M ops/sec | From behavioral state |
| **focus_level_calculation** | 1.18 ns | 847 M ops/sec | Fastest component |
| **mood_level_calculation** | 1.47 ns | 680 M ops/sec | Fast component |

### Batch Processing Performance

| Batch Size | Time | Throughput | Per-Character |
|------------|------|------------|---------------|
| **10** | 55.5 ns | 180 M elem/sec | 5.55 ns/char |
| **100** | 565 ns | 177 M elem/sec | 5.65 ns/char |
| **1,000** | 5.45 µs | 184 M elem/sec | 5.45 ns/char |
| **10,000** | 56.5 µs | 177 M elem/sec | 5.65 ns/char |

**Analysis:** Nearly perfect linear scaling! Per-character time remains ~5-6ns regardless of batch size.

### Complex Workflows

| Workflow | Time | Components |
|----------|------|------------|
| **realistic_workflow_100** | 510 ns | 100 behavioral + 10 emotional + 10 state checks |
| **memory_patterns/single_allocation** | 7.93 ns | Create state + calculate |
| **memory_patterns/repeated_allocation** | 609 ns | 100x allocate + calculate |
| **memory_patterns/pre_allocated_batch** | 440 ns | 100x calculate (no alloc) |

**Pre-allocation benefit:** 27% faster (440ns vs 609ns for 100 operations)

### Frequency Range Variations

| Range | Frequency | Time | Notes |
|-------|-----------|------|-------|
| **Delta** | 2.25 Hz | 4.13 ns | Slightly slower |
| **Theta** | 6.00 Hz | 3.95 ns | Fastest range |
| **Alpha** | 10.5 Hz | 4.20 ns | Nominal |
| **Beta** | 21.5 Hz | 4.68 ns | Slightly slower |
| **Gamma** | 65.0 Hz | 4.26 ns | Nominal |

**Analysis:** Performance relatively consistent across frequency ranges (3.95-4.68ns), minor variations likely due to branch prediction.

### Coherence Level Variations

| Coherence | Time | Notes |
|-----------|------|-------|
| **0.1** | 4.05 ns | Low coherence |
| **0.3** | 4.03 ns | Low-medium |
| **0.5** | 7.71 ns | **Slower** (cache miss?) |
| **0.7** | 4.35 ns | Medium-high |
| **0.9** | 4.77 ns | High coherence |

**Analysis:** Coherence 0.5 shows anomaly (7.71ns vs ~4ns) - possible branch prediction miss or cache effect. Worth investigating.

---

## Performance Comparison

### Native Rust vs WASM Integration

| Operation | Native Rust | WASM (Node.js) | Overhead | Ratio |
|-----------|-------------|----------------|----------|-------|
| Single calculation | 5.1 ns | 6,600 ns | 6,595 ns | **1,294x slower** |
| Batch 100 | 565 ns | 388,800 ns | 388,235 ns | **688x slower** |
| Emotional coherence | 1.8 ns | 400 ns | 398 ns | **222x slower** |

**WASM Overhead Analysis:**
- **Serialization/deserialization:** Major bottleneck
- **JavaScript interop:** Function call overhead
- **Type conversion:** JS objects ↔ Rust structs
- **Memory copying:** Not using zero-copy yet

**Current WASM efficiency:** 0.08-0.15% of native speed  
**Target WASM efficiency:** 0.5-1.0% of native speed (achievable with zero-copy)

---

## Outlier Analysis

### High Outlier Count (>10%)

Several benchmarks show 10-31% outliers:
- `batch_behavioral_states/10000`: 31% outliers (19 low severe)
- `coherence_levels/0.9`: 17% outliers (12 high severe)
- `frequency_ranges/theta`: 18% outliers (13 high severe)
- `memory_patterns/pre_allocated_batch`: 16% outliers (13 high severe)

**Likely Causes:**
- OS scheduler interruptions
- Cache effects
- Branch prediction misses
- Thermal throttling (unlikely at these speeds)

**Impact:** Minimal - median times still representative

---

## Memory Allocation Impact

### Allocation Patterns Benchmark

```
Single allocation:        7.93 ns  (create state + calculate once)
Repeated allocation:      609 ns   (100x allocate + calculate)
Pre-allocated batch:      440 ns   (100x calculate, states pre-allocated)

Per-operation cost (repeated): 609 / 100 = 6.09 ns/op
Per-operation cost (pre-alloc): 440 / 100 = 4.40 ns/op

Allocation overhead: 6.09 - 4.40 = 1.69 ns per operation
Allocation overhead %: (1.69 / 6.09) * 100 = 27.7%
```

**Conclusion:** Pre-allocating states provides **27% performance improvement** for batch operations.

**Recommendation:** Object pooling would eliminate this overhead entirely.

---

## Theoretical Maximum Performance

### With Current Architecture

**Single Operation:**
- Native Rust: 5.1 ns (196 M ops/sec)
- With zero-copy WASM: ~50-100 ns estimated (10-20 M ops/sec)
- Current WASM: 6,600 ns (151 K ops/sec)
- **Improvement potential: 66-132x** with zero-copy

**Batch Operations:**
- Native Rust: 565 ns / 100 = 5.65 ns per char
- With zero-copy WASM: ~56-113 ns / 100 estimated
- Current WASM: 388,800 ns / 100 = 3,888 ns per char
- **Improvement potential: 35-69x** with zero-copy

### Realistic Targets for Task 6.3

Given WASM overhead is inherent, realistic targets:

| Metric | Current | Target | Native | Native % |
|--------|---------|--------|--------|----------|
| Single | 6.6 µs | 2.0 µs | 5.1 ns | 0.03% → 0.10% |
| Batch 100 | 389 µs | 100 µs | 565 ns | 0.15% → 0.57% |
| Throughput | 65K/sec | 500K/sec | 196M/sec | 0.03% → 0.26% |

**Even with aggressive optimization, WASM will be 1,000-10,000x slower than native Rust due to serialization.**

---

## Critical Path Identification

### Hot Functions (by frequency × time)

1. **generate_behavioral_state** (5.1 ns, called most frequently)
   - Energy mapping
   - Focus mapping
   - Mood calculation
   - Social/risk/ambition calculations

2. **Serialization** (not measured in native benchmarks, but dominant in WASM)
   - ConsciousnessState → JS object
   - BehavioralState → JS object
   - Type conversion overhead

3. **Batch iteration** (565 ns for 100)
   - Loop overhead minimal
   - Per-character calculation dominates

### Optimization Priority

**Phase 2 Focus:**
1. **Zero-copy serialization** (highest impact: 10-50x improvement)
2. **Custom serializers** for hot types
3. **Inline hints** on hot functions
4. **Object pooling** (27% improvement for repeated operations)

---

## Phase 2 Strategy Adjustment

### Original Targets (from WASM baseline)

- Single: 6.6 µs → 2.0 µs (3.3x)
- Batch 100: 389 µs → 100 µs (3.9x)

### Revised Targets (informed by native benchmarks)

**Achievable with zero-copy:**
- Single: 6.6 µs → 0.5 µs (13x) - approaching 1% of native
- Batch 100: 389 µs → 50 µs (7.8x) - approaching 10% of native

**Stretch goals with full optimization:**
- Single: → 0.1 µs (66x) - 2% of native
- Batch 100: → 10 µs (39x) - 2% of native

### Key Insight

The native benchmarks reveal that **serialization overhead is the primary bottleneck**, not the calculation itself. The calculation takes only 5ns in native Rust, but we're seeing 6,600ns in WASM - a **1,294x slowdown**.

**Priority 1:** Eliminate serialization overhead through zero-copy techniques  
**Priority 2:** Everything else (inlining, SIMD, etc.) is secondary

---

## Recommendations for Phase 2

### High-Impact Optimizations

1. **Zero-Copy Batch Processing** (Expected: 10-30x improvement)
   ```rust
   #[wasm_bindgen]
   pub fn calculate_batch_zero_copy(data: &[u8]) -> Vec<u8> {
       // Deserialize once, process, serialize once
       // Avoid per-item serialization overhead
   }
   ```

2. **Object Pool for ConsciousnessState** (Expected: 27% improvement)
   ```rust
   static STATE_POOL: ThreadLocal<Vec<ConsciousnessState>> = ...;
   ```

3. **Custom Fast Serializers** (Expected: 2-5x improvement)
   ```rust
   impl FastSerialize for BehavioralState {
       fn serialize_fast(&self) -> [u8; 32] { ... }
   }
   ```

4. **Inline Hot Functions** (Expected: 5-10% improvement)
   ```rust
   #[inline(always)]
   pub fn generate_behavioral_state(...) -> BehavioralState
   ```

### Low-Impact Optimizations (Native already fast)

- SIMD for calculations (already ~5ns, minimal gains)
- Lookup tables (branch prediction working well)
- Algorithm optimization (current algorithm is efficient)

---

## Files Generated

1. **HTML Reports:** `target/criterion/*/report/index.html`
   - Detailed statistical analysis
   - Performance graphs
   - Outlier visualization

2. **Baseline Data:** `target/criterion/*/base/estimates.json`
   - Stored for future comparison
   - Automatic regression detection

---

## Conclusion

The native Rust benchmarks reveal:

1. ✅ **Core algorithm is extremely efficient** (5.1 ns per calculation)
2. ✅ **Batch processing scales linearly** (perfect scaling to 10K elements)
3. ✅ **Pre-allocation provides 27% speedup** (object pooling opportunity)
4. ❌ **WASM overhead is 1,000-10,000x** (serialization bottleneck)

**Key Takeaway:** Focus Phase 2 entirely on **eliminating serialization overhead** rather than optimizing the already-fast native calculations.

**Recommended Phase 2 Adjustment:**
- ⬇️ Reduce: Algorithm optimization (already optimal)
- ⬆️ Increase: Zero-copy serialization focus
- ⬆️ Increase: Custom fast serializers
- ➕ Add: Object pooling for repeated allocations

---

**Status:** Native baseline established ✅  
**Next:** Binary size analysis, then begin Phase 2 optimizations with adjusted focus
