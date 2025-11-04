# Requirements Document

## Introduction

The World History Simulation Engine currently uses JavaScript-based consciousness calculations for NPC behavioral state generation. A high-performance Rust/WASM consciousness engine has been developed and is ready for integration. This feature will connect the WASM engine to the simulation, providing 2-10x performance improvements for large-scale character simulations while maintaining full backward compatibility.

## Glossary

- **WASM Engine**: The Rust-compiled WebAssembly consciousness calculation module published as npm package `@world-history-sim/consciousness-engine-wasm`
- **Consciousness Engine Wrapper**: The JavaScript API wrapper (`ConsciousnessEngineWasm.js`) provided by the npm package that offers automatic fallback to JavaScript
- **Behavioral State Service**: The domain service responsible for generating character behavioral states from consciousness parameters
- **LOD Manager**: Level-of-detail manager that processes population groups in batches
- **Turn Manager**: Service that coordinates turn-based simulation processing
- **Simulation Context**: React context providing global simulation state and services
- **Graceful Fallback**: Automatic switching to JavaScript implementation when WASM is unavailable

## Requirements

### Requirement 1: WASM Package Integration

**User Story:** As a developer, I want the WASM consciousness engine package installed as an npm dependency, so that it can be imported and used by simulation services with standard JavaScript tooling.

#### Acceptance Criteria

1. WHEN the WASM package is built, THE System SHALL generate the `pkg/` directory with all necessary WASM artifacts in `rust-wasm/consciousness-engine/`
2. WHEN the package is installed in sim-engine, THE System SHALL make the `ConsciousnessEngineWasm` class available via npm import `@world-history-sim/consciousness-engine-wasm`
3. WHEN the WASM binary is loaded, THE System SHALL verify the binary size is approximately 389 KB and loads successfully
4. WHERE the package is installed, THE System SHALL include the complete package structure including `.wasm`, `.js`, `.d.ts`, and wrapper files
5. IF the WASM package installation fails, THEN THE System SHALL provide clear error messages indicating the npm installation issue

### Requirement 2: Service Layer Integration

**User Story:** As a simulation engineer, I want the BehavioralStateService to use the WASM engine for calculations, so that consciousness processing is accelerated without changing the API.

#### Acceptance Criteria

1. WHEN `BehavioralStateService.generateBehavioralState()` is called, THE Service SHALL use the WASM engine's `calculateBehavioralState()` method for computation
2. WHEN the WASM engine is unavailable, THE Service SHALL automatically fall back to the existing JavaScript implementation without errors
3. WHEN behavioral states are generated, THE Service SHALL produce identical results whether using WASM or JavaScript implementations
4. WHERE consciousness parameters are validated, THE Service SHALL use the WASM engine's validation methods for consistency
5. IF calculation errors occur, THEN THE Service SHALL log the error and retry using the JavaScript fallback

### Requirement 3: Batch Processing for LOD

**User Story:** As a performance engineer, I want population groups to be processed in batches using WASM, so that large-scale simulations with 100+ NPCs run efficiently.

#### Acceptance Criteria

1. WHEN the LODManager processes population groups, THE Manager SHALL use the WASM engine's `calculateBatchBehavioralStates()` method for batch calculations
2. WHEN batch processing 100 characters, THE System SHALL complete calculations in under 1 millisecond using WASM
3. WHILE processing batches, THE System SHALL maintain character order and correctly map results back to individual characters
4. WHERE batch sizes exceed 1000 characters, THE System SHALL chunk the batch into smaller groups to prevent memory issues
5. IF batch processing fails, THEN THE System SHALL fall back to individual character processing using JavaScript

### Requirement 4: Initialization and Lifecycle

**User Story:** As an application developer, I want the WASM engine initialized at application startup, so that it's ready when simulation begins and performance is optimal.

#### Acceptance Criteria

1. WHEN the application starts, THE System SHALL initialize the WASM engine singleton instance before any simulation operations
2. WHEN initialization completes, THE System SHALL log whether WASM acceleration is enabled or JavaScript fallback is active
3. WHILE the application is running, THE System SHALL maintain a single WASM engine instance shared across all services
4. WHERE initialization fails, THE System SHALL continue with JavaScript fallback and not block application startup
5. IF the WASM engine is reinitialized, THEN THE System SHALL reuse the existing instance rather than creating duplicates

### Requirement 5: Turn-Based Processing Integration

**User Story:** As a simulation designer, I want turn processing to leverage WASM batch calculations, so that each turn completes faster with large NPC populations.

#### Acceptance Criteria

1. WHEN `TurnManager.processTurn()` is called, THE Manager SHALL collect all character consciousness states for batch processing
2. WHEN processing a turn with 100+ characters, THE Manager SHALL use the WASM engine's batch processing capabilities
3. WHILE updating character states, THE Manager SHALL apply the calculated behavioral states back to character entities correctly
4. WHERE turn processing encounters errors, THE Manager SHALL isolate failures to individual characters and continue processing others
5. IF WASM batch processing fails, THEN THE Manager SHALL fall back to sequential JavaScript processing for that turn

### Requirement 6: Performance Monitoring

**User Story:** As a system administrator, I want performance metrics tracked for WASM operations, so that I can verify acceleration is working and monitor system health.

#### Acceptance Criteria

1. WHEN WASM operations complete, THE System SHALL track the number of WASM calls, fallback calls, and total computation time
2. WHEN performance statistics are requested, THE System SHALL provide metrics including average operation time and WASM enabled status
3. WHILE the simulation runs, THE System SHALL update performance counters in real-time without impacting calculation speed
4. WHERE performance degrades, THE System SHALL log warnings if WASM operations are slower than expected thresholds
5. IF WASM is disabled, THEN THE System SHALL clearly indicate JavaScript fallback is active in performance statistics

### Requirement 7: Error Handling and Fallback

**User Story:** As a quality assurance engineer, I want robust error handling with automatic fallback, so that simulations remain stable even when WASM encounters issues.

#### Acceptance Criteria

1. WHEN WASM initialization fails, THE System SHALL automatically enable JavaScript fallback mode without user intervention
2. WHEN WASM calculations throw errors, THE System SHALL catch exceptions, log details, and retry using JavaScript implementation
3. WHILE operating in fallback mode, THE System SHALL maintain full functionality with identical API behavior
4. WHERE invalid inputs are provided, THE System SHALL validate and sanitize data before passing to WASM or JavaScript implementations
5. IF critical errors occur repeatedly, THEN THE System SHALL disable WASM permanently for the session and log diagnostic information

### Requirement 8: Backward Compatibility

**User Story:** As a user with existing save files, I want the WASM integration to work seamlessly with my saved worlds, so that I can continue my simulations without data loss or behavior changes.

#### Acceptance Criteria

1. WHEN loading existing save files, THE System SHALL process character consciousness data correctly regardless of WASM availability
2. WHEN saving world state, THE System SHALL store consciousness data in the same format as before WASM integration
3. WHILE simulations run, THE System SHALL produce identical behavioral outcomes whether using WASM or JavaScript
4. WHERE character data is migrated, THE System SHALL maintain all consciousness parameters and behavioral states accurately
5. IF save file format changes are needed, THEN THE System SHALL provide automatic migration with no user action required

### Requirement 9: Development and Testing Support

**User Story:** As a developer, I want comprehensive testing utilities and documentation, so that I can verify WASM integration works correctly and debug issues efficiently.

#### Acceptance Criteria

1. WHEN running tests, THE System SHALL provide test utilities that verify WASM and JavaScript implementations produce identical results
2. WHEN debugging issues, THE System SHALL offer detailed logging of WASM operations, fallback triggers, and performance metrics
3. WHILE developing, THE System SHALL support running with WASM disabled via configuration flag for comparison testing
4. WHERE integration tests are executed, THE System SHALL validate all WASM API methods work correctly with simulation data
5. IF test failures occur, THEN THE System SHALL provide clear error messages indicating whether the issue is WASM-specific or general
