# Consciousness Engine - Rust/WebAssembly Port

A high-performance consciousness simulation engine implemented in Rust and compiled to WebAssembly for 40-90x performance improvement over JavaScript.

## Overview

This project implements a quantum-inspired consciousness model for behavioral simulation in the World History Simulation Engine. The Rust/WebAssembly implementation provides native performance while maintaining JavaScript interoperability.

## Architecture

- **consciousness_module**: Core consciousness calculations and behavioral state management
- **memory_module**: Event significance calculation and memory lifecycle management
- **decision**: Interaction weighting and behavior generation algorithms
- **emotion**: Emotional processing utilities
- **types**: Shared type definitions with dual WASM-compatible and internal representations
- **wasm**: WebAssembly bindings and serialization

## Development Setup

### Prerequisites

- Rust 1.70+ with wasm32 target
- wasm-pack for WebAssembly building and testing

### Installation

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### Building

```bash
# Check compilation
cargo check

# Run tests
cargo test

# Build for WebAssembly
wasm-pack build --target web --out-dir pkg

# Build with optimizations
wasm-pack build --target web --out-dir pkg --release
```

### Development Workflow

```bash
# Format code
cargo fmt

# Run linter
cargo clippy

# Run benchmarks
cargo criterion

# Generate documentation
cargo doc --open
```

## Performance Targets

- **40-90x performance improvement** over JavaScript baseline
- **Quantum-inspired consciousness model** with gamma frequency (40Hz) baseline
- **Behavioral coherence calculations** for realistic NPC behavior
- **Memory significance processing** for event-driven learning

## Integration

The compiled WebAssembly module can be imported in JavaScript/TypeScript:

```javascript
import init, { ConsciousnessEngine } from './pkg/consciousness_engine.js';

async function runSimulation() {
  await init();
  const engine = new ConsciousnessEngine();
  // Use the engine for behavioral calculations
}
```

## Testing

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_behavioral_state

# Run with coverage (requires tarpaulin)
cargo tarpaulin
```

## Benchmarking

```bash
# Run benchmarks
cargo criterion

# Compare with baseline
cargo criterion --baseline baseline
```

## CI/CD

This project uses GitHub Actions for continuous integration:

- **Test Job**: Compilation checks, linting, testing, and WASM building
- **Benchmark Job**: Performance regression testing
- **Artifact Upload**: WASM packages and benchmark results

## Contributing

1. Follow Rust formatting: `cargo fmt`
2. Pass clippy checks: `cargo clippy`
3. Add tests for new functionality
4. Update benchmarks for performance-critical code
5. Ensure WASM compatibility for all public APIs

## Performance Notes

- Uses `wee_alloc` for optimized WASM memory allocation
- Dual type system: WASM-compatible types for bindings, internal types for computation
- Zero-copy serialization with `serde-wasm-bindgen`
- Behavioral calculations optimized for real-time simulation