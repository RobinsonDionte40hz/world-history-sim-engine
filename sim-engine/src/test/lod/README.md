# LOD System Test Infrastructure

This directory contains test infrastructure for the Level of Detail (LOD) system implementation.

## Test Structure

### Unit Tests (`unit/`)
- `lod-tier.test.js` - LODTier value object tests
- `lod-character-processing.test.js` - Character processing logic tests
- `lod-promotion-demotion.test.js` - Tier transition tests

### Integration Tests (`integration/`)
- `lod-performance.test.js` - Performance benchmarking tests
- `lod-multi-character.test.js` - Multi-character LOD processing tests
- `lod-turn-processing.test.js` - Full turn processing with LOD

### Contract Tests (`contract/`)
- `lod-system-contract.test.js` - API contract validation
- `lod-character-contract.test.js` - Character LOD contract tests

### Setup Files
- `test-helpers.js` - Common test utilities and fixtures
- `lod-test-data.js` - Test data factories for LOD scenarios
- `performance-metrics.js` - Performance measurement utilities

## Test Categories

### 1. Value Object Tests
Test the immutable LODTier value object functionality:
- Tier validation
- Promotion/demotion criteria evaluation
- Performance characteristics
- Serialization/deserialization

### 2. Character Processing Tests
Test character processing at different LOD tiers:
- Hero NPC full processing
- Group statistical processing
- Background demographic tracking
- Tier transition logic

### 3. Performance Tests
Benchmark LOD system performance:
- Processing time per character by tier
- Memory usage patterns
- Scalability with 100+ NPCs
- Turn processing throughput

### 4. Integration Tests
Test LOD system integration with existing systems:
- WorldBuilder integration
- TurnManager LOD processing
- Character assignment consistency
- Settlement population management

## Test Data

### Character Fixtures
- `heroCharacter` - Full hero NPC with consciousness
- `groupCharacter` - Statistical group representative
- `backgroundCharacter` - Minimal background demographic

### World Fixtures
- `smallSettlement` - 5-10 characters for unit tests
- `mediumSettlement` - 50+ characters for integration tests
- `largeSettlement` - 100+ characters for performance tests

### Performance Benchmarks
- Target: <2 seconds for 100+ NPC turn processing
- Memory: <50MB for full simulation state
- CPU: Efficient batch processing for group/background tiers

## Running Tests

```bash
# Run all LOD tests
npm test -- --testPathPattern=lod

# Run specific LOD test categories
npm test -- src/test/lod/unit/
npm test -- src/test/lod/integration/
npm test -- src/test/lod/contract/

# Run performance benchmarks
npm test -- src/test/lod/integration/lod-performance.test.js

# Run with coverage
npm test -- --coverage --testPathPattern=lod
```

## Test Organization Principles

1. **TDD Enforcement**: All tests written before implementation
2. **Contract First**: API contracts tested before implementation
3. **Performance First**: Performance requirements tested early
4. **Integration Focus**: Complex interactions tested thoroughly
5. **Immutable Testing**: Value objects tested for immutability
6. **Fixture Reuse**: Common test data shared across tests

## Performance Monitoring

Tests include performance monitoring to ensure LOD system meets requirements:

- **Turn Processing**: <2s for 100+ NPCs
- **Memory Usage**: Efficient object pooling and cleanup
- **CPU Utilization**: Background processing doesn't block UI
- **Scalability**: Linear performance scaling with NPC count

## Debugging Support

Test infrastructure includes debugging utilities:
- Character processing traces
- Performance profiling
- Memory leak detection
- Tier transition logging