# Task 6.3: Performance Optimization Plan

## 🎯 Objective

Optimize WASM consciousness engine for maximum performance while maintaining current 5-10x improvement baseline. Target: Further 2-3x improvement through strategic optimizations.

## 📊 Current Performance Baseline

### As of October 17, 2025

**Single Character Calculation**:
- JavaScript: ~0.015ms
- WASM (current): ~0.003ms
- Improvement: **5x**

**Batch Processing (100 characters)**:
- JavaScript: ~1.5ms  
- WASM (current): ~0.15ms
- Improvement: **10x**

**Throughput**:
- JavaScript: ~67,000 NPCs/second
- WASM (current): ~670,000 NPCs/second
- Improvement: **10x**

**Memory**:
- Binary size: 389 KB (optimized)
- Memory usage: Minimal (no heap allocations for calculations)

## 🔍 Optimization Targets

### Priority 1: Critical Path Optimization

1. **Behavioral State Calculation** (Most called function)
   - Current: ~0.003ms per call
   - Target: <0.002ms (33% improvement)
   - Method: SIMD vectorization, inline hints

2. **Batch Processing Pipeline**
   - Current: ~0.15ms for 100 NPCs
   - Target: <0.10ms (33% improvement)
   - Method: Memory pooling, zero-copy operations

3. **Serialization/Deserialization**
   - Current: Automatic via serde-wasm-bindgen
   - Target: 20% reduction in overhead
   - Method: Custom serializers for hot paths

### Priority 2: Memory Optimization

1. **Binary Size Reduction**
   - Current: 389 KB
   - Target: <300 KB (23% reduction)
   - Method: Strip unused features, optimize wasm-opt settings

2. **Runtime Memory Usage**
   - Current: Minimal
   - Target: Add pooling for repeated allocations
   - Method: Implement object pooling for ConsciousnessState

3. **Cache Optimization**
   - Current: No caching
   - Target: Implement result caching for identical inputs
   - Method: LRU cache with configurable size

### Priority 3: Advanced Features

1. **SIMD Vectorization**
   - Target: Batch calculations using SIMD
   - Method: Use portable_simd for parallel math operations

2. **Multi-threading Support**
   - Target: Web Workers integration for large batches
   - Method: rayon integration (future work)

3. **Incremental Compilation**
   - Target: Faster development builds
   - Method: Optimize Cargo.toml settings

## 📝 Implementation Tasks

### Phase 1: Profiling & Analysis (4 hours)

- [ ] **Profile hot paths**
  - Use criterion for micro-benchmarks
  - Identify top 5 performance bottlenecks
  - Measure allocation patterns
  - Create baseline metrics

- [ ] **Memory profiling**
  - Track heap allocations
  - Identify unnecessary clones
  - Find memory fragmentation issues
  - Measure WASM linear memory usage

- [ ] **Binary size analysis**
  - Use twiggy to analyze WASM binary
  - Identify largest functions
  - Find unused code sections
  - Analyze debug symbol overhead

### Phase 2: Critical Path Optimization (8 hours)

- [ ] **Optimize behavioral state calculation**
  ```rust
  // Add inline hints
  #[inline(always)]
  pub fn calculate_behavioral_state_fast(state: &ConsciousnessState) -> BehavioralState {
      // Use stack-allocated arrays
      // Avoid branches with lookup tables
      // Use SIMD for parallel calculations
  }
  ```

- [ ] **Implement zero-copy batch processing**
  ```rust
  // Process directly from JavaScript TypedArray
  #[wasm_bindgen]
  pub fn calculate_batch_zero_copy(data: &[u8]) -> Vec<u8> {
      // Deserialize in-place
      // Process without intermediate allocations
      // Serialize directly to output buffer
  }
  ```

- [ ] **Optimize serialization hot paths**
  ```rust
  // Custom serializers for frequently used types
  impl ConsciousnessState {
      pub fn serialize_fast(&self) -> [u8; 64] {
          // Fixed-size serialization
          // No heap allocation
          // Direct memory copy
      }
  }
  ```

### Phase 3: Memory Optimization (4 hours)

- [ ] **Implement object pooling**
  ```rust
  pub struct ObjectPool<T> {
      objects: Vec<T>,
      available: Vec<usize>,
  }
  
  impl ObjectPool<ConsciousnessState> {
      pub fn get(&mut self) -> PooledObject<ConsciousnessState> {
          // Reuse existing objects
          // Reduce allocations
      }
  }
  ```

- [ ] **Add result caching**
  ```rust
  pub struct ResultCache {
      cache: HashMap<u64, BehavioralState>,
      max_size: usize,
  }
  
  impl ResultCache {
      pub fn get_or_compute(&mut self, state: &ConsciousnessState) -> BehavioralState {
          let hash = self.hash_state(state);
          self.cache.entry(hash).or_insert_with(|| {
              calculate_behavioral_state(state)
          }).clone()
      }
  }
  ```

- [ ] **Optimize binary size**
  ```toml
  # Cargo.toml optimizations
  [profile.release]
  opt-level = "z"           # Optimize for size
  lto = true                # Link-time optimization
  codegen-units = 1         # Single codegen unit
  strip = true              # Strip symbols
  panic = "abort"           # Reduce panic handler size
  ```

### Phase 4: Advanced Optimizations (6 hours)

- [ ] **SIMD vectorization**
  ```rust
  #[cfg(target_feature = "simd128")]
  use std::simd::*;
  
  pub fn calculate_batch_simd(states: &[ConsciousnessState]) -> Vec<BehavioralState> {
      // Process 4 states at once using SIMD
      // Vectorized calculations
      // Parallel memory access
  }
  ```

- [ ] **Lookup table optimizations**
  ```rust
  // Pre-computed lookup tables
  static ENERGY_LOOKUP: [EnergyLevel; 256] = generate_energy_lookup();
  static FOCUS_LOOKUP: [FocusLevel; 256] = generate_focus_lookup();
  
  pub fn map_frequency_to_energy_fast(freq: f64) -> EnergyLevel {
      let index = ((freq - 3.0) / 12.0 * 255.0) as usize;
      ENERGY_LOOKUP[index]
  }
  ```

- [ ] **Branch prediction hints**
  ```rust
  #[inline(always)]
  fn likely(b: bool) -> bool {
      std::intrinsics::likely(b)
  }
  
  pub fn calculate_with_hints(state: &ConsciousnessState) -> BehavioralState {
      if likely(state.emotional_coherence > 0.5) {
          // Common path - optimized
      } else {
          // Uncommon path
      }
  }
  ```

### Phase 5: Validation & Testing (4 hours)

- [ ] **Performance regression tests**
  ```rust
  #[bench]
  fn bench_single_calculation_optimized(b: &mut Bencher) {
      b.iter(|| {
          calculate_behavioral_state_fast(&test_state)
      });
  }
  
  #[bench]
  fn bench_batch_processing_optimized(b: &mut Bencher) {
      b.iter(|| {
          calculate_batch_zero_copy(&test_batch)
      });
  }
  ```

- [ ] **Memory usage validation**
  - Ensure optimizations don't increase memory usage
  - Validate pooling correctness
  - Test cache eviction behavior

- [ ] **Correctness validation**
  - Ensure optimized code produces identical results
  - Test SIMD correctness on different platforms
  - Validate lookup table accuracy

## 📊 Expected Results

### Performance Improvements

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Single calculation | 0.003ms | 0.002ms | 33% |
| Batch (100) | 0.15ms | 0.10ms | 33% |
| Throughput | 670K/sec | 1M/sec | 50% |
| Binary size | 389 KB | <300 KB | 23% |

### Overall Goal

- **Current**: 5-10x faster than JavaScript
- **Target**: 10-15x faster than JavaScript
- **Method**: Cumulative optimizations across all areas

## 🛠️ Tools & Techniques

### Profiling Tools

```bash
# Criterion benchmarks
cargo bench --features "criterion"

# Binary size analysis
wasm-pack build --release
twiggy top pkg/consciousness_engine_bg.wasm

# Memory profiling
cargo build --release --target wasm32-unknown-unknown
wasm-opt pkg/consciousness_engine_bg.wasm -o optimized.wasm -Oz

# Performance testing
node test-performance-optimized.js
```

### Optimization Flags

```toml
[profile.release]
opt-level = "z"           # Size optimization
lto = "fat"               # Full LTO
codegen-units = 1         # Single unit
strip = "debuginfo"       # Strip debug info
panic = "abort"           # Smaller panic handler

[profile.release-perf]    # Alternative profile for speed
opt-level = 3             # Max speed
lto = "fat"
codegen-units = 1
```

## 📈 Success Criteria

1. **Performance**: Maintain or improve current 5-10x speedup
2. **Binary Size**: Reduce to <300 KB
3. **Memory**: No regression in memory usage
4. **Correctness**: All tests pass, identical results
5. **Compatibility**: No API changes, drop-in replacement

## 🚀 Next Steps

1. Create performance benchmarking suite
2. Profile current implementation
3. Implement optimizations incrementally
4. Validate each optimization
5. Document performance improvements

---

**Status**: 📋 Ready to start  
**Estimated Time**: 18 hours  
**Priority**: High  
**Dependencies**: Tasks 6.1 & 6.2 complete ✅
