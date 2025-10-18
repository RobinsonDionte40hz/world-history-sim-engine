# Binary Size Analysis - WASM Module

**Date**: December 2024  
**Binary Size**: 398,592 bytes (389 KB)  
**Target**: <300 KB (23% reduction needed)

## Top Binary Contributors (by dominance)

### 1. Migration Function (13.18% / 52.5 KB)
- **Export**: `migrate_consciousness_data`
- **Impact**: 52,547 bytes - largest single contributor
- **Analysis**: Data migration utility not needed in production builds
- **Recommendation**: Feature-flag as dev-only or remove entirely

### 2. Function Tables (12.10% / 48.2 KB)
- **Component**: `table[0]` and `elem[0]` 
- **Impact**: 48,220 bytes
- **Analysis**: Dynamic dispatch tables for WASM-JS interop
- **Largest Functions**:
  - `code[278]`: 19.3 KB (string manipulation/formatting)
  - `code[146]`: 3.3 KB
  - `code[498]`: 2.2 KB (error handling)
- **Recommendation**: Strip debug strings, minimize error formatting

### 3. Validation Functions (5.66% / 22.6 KB)
- **Export**: `validate_configuration`
- **Impact**: 22,552 bytes
- **Analysis**: Runtime validation with extensive error messages
- **Recommendation**: Simplify error messages, consider compile-time validation

### 4. Core Runtime (5.34% / 21.3 KB)
- **Component**: `code[3]` (unnamed core function)
- **Impact**: 21,294 bytes
- **Analysis**: Core runtime infrastructure (likely allocation/deallocation)
- **Recommendation**: Cannot remove, but can optimize with smaller allocators

### 5. Standard Library Components (4.12% / 16.4 KB)
- **Component**: `code[2]` (likely std dependencies)
- **Impact**: 16,440 bytes
- **Sub-components**:
  - Random number generation: 2,415 bytes
  - Crypto initialization: Multiple small imports
- **Recommendation**: Use wasm-bindgen alternatives to std crypto

### 6. Memory Influence Calculation (3.37% / 13.4 KB)
- **Export**: `calculate_memory_influence`
- **Impact**: 13,387 bytes
- **Analysis**: Complex memory system calculations
- **Recommendation**: Optimize hot path, consider lookup tables

### 7. Configuration Management (3.45% / 13.8 KB)
- **Export**: `get_default_configuration`
- **Impact**: 13,732 bytes
- **Analysis**: Large default configuration data
- **Recommendation**: Move defaults to JavaScript side

### 8. Batch Processing (2.63% / 10.5 KB)
- **Export**: `process_batch_behaviors`
- **Impact**: 10,456 bytes
- **Analysis**: Core batch calculation function (hot path)
- **Recommendation**: Already optimized, apply inlining

### 9. Behavioral State Functions
- `inspect_behavioral_state`: 10.3 KB (2.58%)
- `validate_template`: 8.8 KB (2.20%)
- `generate_behavior`: 7.8 KB (1.96%)
- `store_memory`: 7.8 KB (1.96%)
- `calculate_batch_behavioral_states`: 3.0 KB (0.74%)
- `calculate_behavioral_state`: 933 bytes (0.23%)
- **Analysis**: Core business logic - minimal fat
- **Recommendation**: Inline calculate_behavioral_state into batch functions

### 10. Data Sections (12.7 KB)
- `data[75]`: 4.7 KB
- `data[76]`: 1.1 KB
- `data[74]`: 6.6 KB
- `data[88]`: 5.5 KB
- `data[111]`: 5.0 KB
- `data[112]`: 844 bytes
- **Analysis**: Static data (strings, error messages, defaults)
- **Recommendation**: Minimize string literals, compress error messages

### 11. Unreachable Code (10.34% / 41.2 KB) ⚠️
- **Impact**: 41,217 bytes of dead code
- **Analysis**: Functions included by linker but never called
- **Recommendation**: Use `opt-level = "z"` and `lto = "fat"` to eliminate

## Optimization Strategy (Prioritized)

### Phase 1: Low-Hanging Fruit (Target: -90 KB / 23%)
**Estimated Impact**: Achieve <300 KB goal

1. **Remove Migration Function** (-52.5 KB / 13%)
   - Action: Feature-flag `migrate_consciousness_data` as dev-only
   - Implementation: `#[cfg(not(target_arch = "wasm32"))]`
   - Risk: None (not used in production)
   
2. **Dead Code Elimination** (-41 KB / 10%)
   - Action: Enable aggressive LTO and optimization
   - Implementation: Update Cargo.toml:
     ```toml
     [profile.release]
     opt-level = "z"           # Optimize for size
     lto = "fat"               # Full link-time optimization
     codegen-units = 1         # Single codegen unit for better optimization
     strip = true              # Remove debug symbols
     panic = "abort"           # Smaller panic handler
     ```
   - Risk: Slightly longer compile times
   
3. **Minimize Debug Strings** (-10 KB / 2.5%)
   - Action: Reduce error message verbosity in table[0] functions
   - Implementation: Replace descriptive errors with error codes
   - Risk: Harder debugging (mitigated with source maps)

**Total Phase 1 Savings**: -103.5 KB (26% reduction)  
**New Size**: ~295 KB ✅ **Goal Achieved**

### Phase 2: Further Optimization (Target: -30 KB / 7.5%)
**Estimated Impact**: Extra headroom for future features

4. **Replace std Crypto with JS** (-16.4 KB / 4%)
   - Action: Use `Math.random()` from JavaScript instead of std crypto
   - Implementation: `#[wasm_bindgen]` wrapper for JS random
   - Risk: Less secure random (acceptable for simulations)
   
5. **Move Configuration to JS** (-13.7 KB / 3.5%)
   - Action: Store default config in JavaScript, pass to WASM
   - Implementation: Refactor `get_default_configuration` to accept JS object
   - Risk: Breaking change for API consumers

**Total Phase 2 Savings**: -30 KB (7.5% reduction)  
**New Size**: ~265 KB (Extra 30 KB headroom)

### Phase 3: Aggressive Optimization (Target: -20 KB / 5%)
**For Future Consideration**

6. **Simplify Validation** (-22.6 KB / 5.6%)
   - Action: Move validation to JavaScript, keep only assertions in WASM
   - Implementation: Create validator.js with same logic
   - Risk: Code duplication, potential divergence
   
7. **Custom Allocator** (-5 KB / 1.2%)
   - Action: Replace default allocator with wee_alloc
   - Implementation: Add wee_alloc dependency
   - Risk: Slower allocations (not a concern for batch operations)

**Total Phase 3 Savings**: -27.6 KB (6.9% reduction)  
**New Size**: ~237 KB (40% smaller than baseline)

## Size Breakdown Summary

| Component | Current Size | % of Total | Optimization Potential |
|-----------|--------------|------------|------------------------|
| Migration function | 52.5 KB | 13.18% | ✅ Remove (-52.5 KB) |
| Unreachable code | 41.2 KB | 10.34% | ✅ Eliminate (-41 KB) |
| Function tables | 48.2 KB | 12.10% | ⚠️ Minimize strings (-10 KB) |
| Validation | 22.6 KB | 5.66% | ⚠️ Simplify (-22.6 KB in Phase 3) |
| Core runtime | 21.3 KB | 5.34% | ❌ Cannot optimize |
| Std library | 16.4 KB | 4.12% | ✅ Replace crypto (-16.4 KB) |
| Configuration | 13.8 KB | 3.46% | ✅ Move to JS (-13.7 KB) |
| Business logic | 50.2 KB | 12.60% | ⚠️ Inline small functions (-5 KB) |
| Data sections | 12.7 KB | 3.19% | ⚠️ Compress strings (-2 KB) |
| Other/imports | 119.7 KB | 30.01% | ⚠️ Various small wins (-10 KB) |

**Total Optimization Potential**: -173.2 KB (43% reduction)  
**Achievable with Phase 1+2**: -133.5 KB (33% reduction) → **265 KB**

## Implementation Checklist

### Immediate Actions (Phase 1)
- [ ] Feature-flag migration function for dev builds only
- [ ] Update Cargo.toml with aggressive optimization settings
- [ ] Rebuild with wasm-pack in release mode
- [ ] Verify size reduction to ~295 KB
- [ ] Run all tests to ensure correctness

### Next Actions (Phase 2)
- [ ] Replace std crypto with JS random wrapper
- [ ] Refactor default configuration to JavaScript
- [ ] Update JavaScript wrapper to pass config
- [ ] Rebuild and verify ~265 KB size
- [ ] Update documentation

### Future Considerations (Phase 3)
- [ ] Evaluate JavaScript-side validation
- [ ] Consider custom allocator (wee_alloc)
- [ ] Profile impact of aggressive inlining
- [ ] Measure size vs performance tradeoffs

## Analysis Tools Used

```bash
# Install twiggy for binary analysis
cargo install twiggy

# Analyze top contributors
twiggy top -n 30 consciousness_engine_bg.wasm

# Analyze dominators (what keeps code in binary)
twiggy dominators consciousness_engine_bg.wasm

# Find specific function paths
twiggy paths consciousness_engine_bg.wasm <function_name>

# Calculate garbage (unreachable code)
twiggy garbage consciousness_engine_bg.wasm
```

## Benchmark Compatibility

All size optimizations maintain performance characteristics:
- Single calculation: 5.1 ns native, 6.6 µs WASM (serialization bottleneck)
- Batch processing: Linear scaling (5.5 ns/char)
- Zero-copy serialization (Phase 2 of performance optimization) compatible with all size reductions

**Key Insight**: Size and performance optimizations are complementary. Removing dead code and simplifying error handling won't affect hot path performance.
