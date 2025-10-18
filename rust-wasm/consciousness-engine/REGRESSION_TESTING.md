# Performance Regression Testing Guide

## Overview

The performance regression test suite (`regression-test-suite.js`) is designed to protect the exceptional performance gains achieved in Epic 7 (272x speedup) by automatically detecting degradations.

## Quick Start

```bash
# Development mode (detailed output)
node regression-test-suite.js

# CI/CD mode (minimal output, exit codes)
node regression-test-suite.js --ci

# Update baseline after intentional optimizations
node regression-test-suite.js --update-baseline
```

## Test Categories

### 1. Single Operation Latency
- **Target**: < 1.0μs per operation
- **Warning**: < 0.8μs
- **Critical**: < 0.6μs  
- **Baseline**: 0.44μs (October 2025)

Measures individual consciousness calculation performance. This is the most variable metric and depends heavily on:
- Build configuration (release vs debug)
- V8 JIT optimization state
- System load

**Note**: Debug builds may show 10-20x slower performance (10-20μs). This is expected. The regression suite detects **changes** from the established baseline, not absolute values.

### 2. Batch Processing (10K NPCs)
- **Target**: < 10ms for 10,000 NPCs
- **Warning**: < 8ms
- **Critical**: < 6ms
- **Baseline**: 4.41ms (October 2025)

Batch processing is more stable and representative of real-world usage. This is the **primary performance indicator**.

### 3. Throughput
- **Target**: > 1,000,000 ops/second
- **Warning**: > 1,500,000 ops/second  
- **Critical**: > 1,800,000 ops/second
- **Baseline**: 2.27M ops/second (October 2025)

Sustained operations per second over a 1-second period. Validates that performance scales linearly.

### 4. Memory Efficiency (Permanent Retention)
- **Target**: < 1.0 bytes/op permanent
- **Warning**: < 0.75 bytes/op
- **Critical**: < 0.5 bytes/op
- **Baseline**: 0.31 bytes/op (October 2025)

Measures permanent memory retention after GC. Near-zero indicates excellent memory pooling and cleanup.

### 5. WASM Memory Stability
- **Target**: < 0.1 MB growth for 50K operations
- **Warning**: < 0.075 MB
- **Critical**: < 0.05 MB
- **Baseline**: ~0 MB (October 2025)

Validates that WASM memory doesn't grow unbounded. Detects memory leaks in the Rust layer.

### 6. Determinism
- **Target**: 100% deterministic
- **Warning**: 100% (no compromise)
- **Critical**: 100% (no compromise)

All operations must produce bit-identical results across runs. This is **non-negotiable** for save/load integrity.

## Interpreting Results

### Status Levels

- **✅ PASS**: Performance meets or exceeds all targets
- **⚠️ WARNING**: Performance is acceptable but approaching thresholds
- **❌ FAIL**: Performance has regressed beyond acceptable limits

### Exit Codes (CI/CD)

- `0`: Success (all tests passed or warnings only)
- `1`: Failure (one or more critical regressions)

## Baseline Methodology

### Original Baseline (Epic 7 - October 2025)

The baseline was established using:
- **Build**: Release mode (`--release` flag)
- **Platform**: Windows 10 x64
- **Node**: v20.15.1
- **Iterations**: 1000 per test with 100-iteration warmup
- **Environment**: Idle system, no background load

### Updating Baselines

Baselines should only be updated after:

1. **Intentional Performance Improvements**
   - SIMD vectorization added
   - Algorithm optimization
   - Better caching strategy
   
2. **Platform/Toolchain Changes**
   - Major Node.js version upgrade
   - Rust compiler upgrade
   - WASM runtime changes

3. **Validation Process**
   - Run full test suite 10 times
   - Verify consistency (< 5% variance)
   - Document changes in `CHANGELOG.md`
   - Update `BASELINE` constant in `regression-test-suite.js`

**Never** update baselines to "fix" failing tests due to regressions!

## Development vs Release Builds

### Debug/Development Builds
- Typical performance: 10-20μs single op, 500K-1M ops/sec
- Used for: Development, debugging, testing
- **Expected behavior**: Tests may fail on absolute values

### Release Builds
- Optimal performance: 0.44μs single op, 2.27M ops/sec
- Used for: Production, benchmarking, CI/CD
- **Expected behavior**: All tests should pass

To generate a release build:
```bash
cargo build --release --target wasm32-unknown-unknown
wasm-bindgen target/wasm32-unknown-unknown/release/consciousness_engine.wasm \
  --out-dir pkg --target nodejs
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Regression Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20.x'
          
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
          
      - name: Build WASM (Release)
        run: |
          cd rust-wasm/consciousness-engine
          cargo build --release --target wasm32-unknown-unknown
          wasm-bindgen target/wasm32-unknown-unknown/release/consciousness_engine.wasm \
            --out-dir pkg --target nodejs
            
      - name: Run Regression Tests
        run: |
          cd rust-wasm/consciousness-engine
          node regression-test-suite.js --ci
```

### GitLab CI Example

```yaml
performance:regression:
  stage: test
  image: rust:latest
  before_script:
    - rustup target add wasm32-unknown-unknown
    - cargo install wasm-bindgen-cli
    - curl -sL https://deb.nodesource.com/setup_20.x | bash -
    - apt-get install -y nodejs
  script:
    - cd rust-wasm/consciousness-engine
    - cargo build --release --target wasm32-unknown-unknown
    - wasm-bindgen target/wasm32-unknown-unknown/release/consciousness_engine.wasm --out-dir pkg --target nodejs
    - node regression-test-suite.js --ci
  artifacts:
    reports:
      junit: rust-wasm/consciousness-engine/regression-test-results.json
```

## Troubleshooting

### Test Failures in Development

**Symptom**: Single operation tests fail with 10-20μs latency

**Cause**: Running debug build instead of release build

**Solution**: This is expected behavior. Focus on batch processing tests which are more stable. Or build in release mode.

### Memory Growth Failures

**Symptom**: WASM memory growth exceeds 0.1 MB

**Cause**: 
- Memory leak in Rust code
- TypedArray not being released
- Object pool growing unbounded

**Solution**:
1. Check Rust code for `mem::forget` calls
2. Verify object pool size limits
3. Run with `--expose-gc` flag to force GC: `node --expose-gc regression-test-suite.js`

### Determinism Failures

**Symptom**: Determinism rate < 100%

**Cause**:
- Timestamp inclusion in hash
- Floating-point non-determinism
- Random number generator not seeded

**Solution**: 
1. Verify `cachedTimestamp` field is excluded from hashing
2. Check for `Date.now()` calls in calculation paths
3. Validate LCG seed consistency

### Throughput Variability

**Symptom**: Throughput varies ±30% between runs

**Cause**: 
- System background processes
- V8 JIT optimization timing
- CPU frequency scaling

**Solution**:
- Run on idle system
- Increase test duration (currently 1 second)
- Take median of 10 runs instead of single run

## Performance Optimization Tips

### When Tests Are Passing

- **Don't optimize prematurely**: 272x speedup already exceeds targets
- **Focus on features**: Add functionality, not micro-optimizations
- **Monitor trends**: Watch for gradual degradation over time

### When Tests Start Failing

1. **Identify the regression**
   - Check git history: `git log --oneline --all`
   - Bisect if needed: `git bisect start`
   
2. **Profile the specific test**
   - Add `console.time()` markers
   - Use Node.js profiler: `node --prof regression-test-suite.js`
   - Analyze: `node --prof-process isolate-*.log`
   
3. **Fix or revert**
   - If fix is obvious: implement and test
   - If complex: revert commit and investigate offline
   - If intentional: update baseline with documentation

## Future Enhancements

- [ ] Automated baseline calibration
- [ ] Performance trend visualization
- [ ] Integration with performance.measureUserAgentSpecificMemory()
- [ ] Flamegraph generation
- [ ] Comparative analysis between Node.js versions
- [ ] WASM module size tracking
- [ ] Startup time benchmarking

## Related Documentation

- `TASK_7.1_COMPLETE.md` - Original performance baseline
- `TASK_7.3_COMPLETE.md` - Determinism validation suite
- `validate-determinism.js` - Extended determinism tests
- `benchmark-performance.js` - Original benchmark implementation

## References

- Epic 7 Specification: `.kiro/steering/epic7-performance-validation.md`
- Rust WASM Optimization: `rust-wasm/consciousness-engine/OPTIMIZATION.md`
- Memory Analysis: `TASK_7.2.2_COMPLETE.md`

---

**Last Updated**: October 18, 2025  
**Baseline Version**: 0.1.0  
**Status**: ✅ Production Ready
