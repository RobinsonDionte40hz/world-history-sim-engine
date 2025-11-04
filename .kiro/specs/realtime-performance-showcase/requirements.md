# Requirements Document

## Introduction

The World History Simulation Engine currently operates exclusively in turn-based mode, where users manually call `processTurn()` to advance time. To showcase the real-time performance capabilities of the Rust/WASM consciousness engine to potential npm package customers, we need to add a real-time simulation mode that automatically processes turns at configurable intervals while displaying live performance metrics. This feature must integrate seamlessly with all existing simulation components including SimulationService, LODManager, WorldHistorySimInterface, and SimulationContext, while maintaining full compatibility with the turn-based workflow. The real-time mode will demonstrate the WASM package's ability to process hundreds of NPCs simultaneously with sub-millisecond response times, making it an effective marketing tool for the `@world-history-sim/consciousness-engine-wasm` package.

## Glossary

- **Real-Time Mode**: A continuous simulation mode where `SimulationContext.processTurn()` is called automatically at configurable intervals via `setInterval`
- **Turn-Based Mode**: The existing manual simulation mode where users explicitly call `processTurn()` via UI controls
- **SimulationService**: The core application service that orchestrates turn processing, manages world state, and coordinates LOD operations
- **SimulationContext**: The React context providing global simulation state, turn processing functions, and LOD management
- **WorldHistorySimInterface**: The main dashboard UI component displaying simulation state, NPC activity, events, and statistics
- **LODManager**: Level-of-detail manager that processes population groups in batches (hero, group, background tiers)
- **Performance Metrics**: Real-time statistics including turn processing time, TPS (turns per second), LOD distribution, WASM utilization, and memory usage
- **Turn Processing Pipeline**: The complete flow from `processTurn()` → LOD pre-processing → `SimulationService.processTurn()` → LOD post-processing → state persistence
- **WASM Engine**: The Rust-compiled WebAssembly consciousness calculation module integrated into BehavioralStateService and LODManager

## Requirements

### Requirement 1: Real-Time Simulation Mode

**User Story:** As a potential customer evaluating the WASM package, I want to see the simulation running in real-time with live performance metrics, so that I can understand the performance benefits before purchasing or integrating the package.

#### Acceptance Criteria

1. WHEN the user enables real-time mode, THE System SHALL automatically process turns at the configured interval without manual input
2. WHEN real-time mode is active, THE System SHALL display a visual indicator showing the mode is running
3. WHILE real-time mode runs, THE System SHALL allow users to pause, resume, or stop the simulation at any time
4. WHERE the simulation speed is adjustable, THE System SHALL provide controls for 1x, 2x, 5x, 10x, and custom speed multipliers
5. IF the system cannot maintain the target speed, THEN THE System SHALL display a warning and show actual achieved speed

### Requirement 2: Performance Dashboard

**User Story:** As a developer evaluating performance, I want to see real-time metrics displayed prominently, so that I can assess the WASM engine's capabilities for my use case.

#### Acceptance Criteria

1. WHEN real-time mode is active, THE Dashboard SHALL display current FPS (turns per second) with sub-100ms update frequency
2. WHEN processing turns, THE Dashboard SHALL show average turn processing time in milliseconds with precision to 0.001ms
3. WHILE the simulation runs, THE Dashboard SHALL display the current NPC count and breakdown by LOD tier
4. WHERE WASM is enabled, THE Dashboard SHALL show the percentage of calculations using WASM vs JavaScript fallback
5. IF performance degrades below target thresholds, THEN THE Dashboard SHALL highlight affected metrics in warning colors

### Requirement 3: Mode Switching and State Management

**User Story:** As a user, I want to seamlessly switch between turn-based and real-time modes, so that I can compare the two approaches and choose the best for my needs.

#### Acceptance Criteria

1. WHEN switching from turn-based to real-time mode, THE System SHALL preserve all world state including currentSimulationState, turnHistory, and LOD statistics
2. WHEN switching from real-time to turn-based mode, THE System SHALL clear the `setInterval` timer and allow manual `processTurn()` calls
3. WHILE switching modes, THE System SHALL maintain all character states, consciousness data, relationships, and historical records without data loss
4. WHERE mode switching occurs, THE SimulationContext SHALL update the `isRealTimeMode` state and notify WorldHistorySimInterface within 100ms
5. IF a mode switch fails, THEN THE System SHALL revert to the previous mode, log the error, and display an error message to the user

### Requirement 4: Integration with SimulationContext

**User Story:** As a developer, I want real-time mode to integrate cleanly with SimulationContext, so that all existing simulation functionality continues to work without modification.

#### Acceptance Criteria

1. WHEN real-time mode is enabled, THE SimulationContext SHALL add `isRealTimeMode`, `realTimeSpeed`, and `startRealTimeMode()` to its context value
2. WHEN `startRealTimeMode(speed)` is called, THE Context SHALL create a `setInterval` that calls `processTurn()` at the specified interval
3. WHILE real-time mode runs, THE Context SHALL continue to update `currentSimulationState`, `currentTurn`, and `turnHistory` exactly as in turn-based mode
4. WHERE `stopRealTimeMode()` is called, THE Context SHALL clear the interval timer and set `isRealTimeMode` to false
5. IF `processTurn()` throws an error during real-time mode, THEN THE System SHALL log the error, stop real-time mode, and notify the user

### Requirement 5: Integration with WorldHistorySimInterface

**User Story:** As a user, I want the main dashboard to support both turn-based and real-time modes with appropriate UI controls, so that I can easily switch between modes and monitor performance.

#### Acceptance Criteria

1. WHEN WorldHistorySimInterface renders, THE Component SHALL display mode toggle controls in the header alongside the existing "Process Turn" button
2. WHEN real-time mode is active, THE Component SHALL disable the manual "Process Turn" button and show real-time controls (pause, resume, speed adjustment)
3. WHILE real-time mode runs, THE Component SHALL continue to display all existing dashboard views (overview, timeline, statistics, characters) with live updates
4. WHERE performance metrics are displayed, THE Component SHALL show real-time TPS, average turn time, and LOD processing metrics
5. IF the user switches views during real-time mode, THEN THE System SHALL maintain real-time processing in the background without interruption

### Requirement 6: Integration with LODManager

**User Story:** As a performance engineer, I want real-time mode to leverage LOD batch processing, so that large-scale simulations maintain high performance even at fast speeds.

#### Acceptance Criteria

1. WHEN real-time mode processes turns, THE System SHALL use the existing LOD pipeline (pre-turn LOD → main processing → post-turn LOD)
2. WHEN processing 100+ NPCs in real-time, THE LODManager SHALL use WASM batch processing for group-tier characters
3. WHILE real-time mode runs, THE System SHALL track and display LOD tier distribution (hero, group, background) in real-time
4. WHERE LOD tier transitions occur, THE System SHALL record transitions and display them in the performance dashboard
5. IF LOD processing fails during real-time mode, THEN THE System SHALL fall back to JavaScript processing and continue without stopping




### Requirement 7: Performance Monitoring and Metrics

**User Story:** As a developer evaluating the WASM package, I want detailed real-time performance metrics, so that I can assess the package's capabilities for my use case.

#### Acceptance Criteria

1. WHEN real-time mode is active, THE System SHALL track actual TPS (turns per second) by measuring time between `processTurn()` completions
2. WHEN displaying metrics, THE System SHALL show average turn processing time from `SimulationService.processTurn()` results
3. WHILE the simulation runs, THE System SHALL display LOD processing metrics including `lodProcessingMetrics.averageTurnDuration`
4. WHERE WASM is enabled, THE System SHALL show WASM utilization percentage from `consciousnessEngine.getPerformanceStats()`
5. IF performance degrades below target thresholds, THEN THE System SHALL highlight affected metrics and suggest optimizations

### Requirement 8: Visual Performance Indicators

**User Story:** As a user watching the real-time simulation, I want visual feedback showing system performance, so that I can immediately see when performance is good or degrading.

#### Acceptance Criteria

1. WHEN performance is optimal (>30 TPS), THE Indicator SHALL display green status with smooth animations
2. WHEN performance is acceptable (15-30 TPS), THE Indicator SHALL display yellow status with moderate animations
3. WHILE performance is poor (<15 TPS), THE Indicator SHALL display red status and suggest reducing NPC count or speed
4. WHERE WASM provides speedup, THE Indicator SHALL show the performance multiplier (e.g., "5.2x faster with WASM")
5. IF the system switches to JavaScript fallback, THEN THE Indicator SHALL notify the user and show the performance impact

### Requirement 9: Speed Control and Throttling

**User Story:** As a user, I want to control the real-time simulation speed, so that I can balance between visual clarity and performance demonstration.

#### Acceptance Criteria

1. WHEN adjusting speed, THE System SHALL provide preset buttons for 1x (1 TPS), 2x (2 TPS), 5x (5 TPS), 10x (10 TPS), and 25x (25 TPS)
2. WHEN using custom speed, THE System SHALL allow slider input from 0.1 TPS to 50 TPS with 0.1 TPS increments
3. WHILE speed changes, THE System SHALL update the `setInterval` delay to match the new target TPS
4. WHERE the system cannot achieve the target speed, THE System SHALL display actual achieved TPS and suggest reducing target
5. IF speed is set too high for the hardware, THEN THE System SHALL automatically throttle to maximum achievable speed without dropping turns

### Requirement 10: Turn History and Event Tracking

**User Story:** As a user, I want turn history and events to accumulate during real-time mode, so that I can review what happened after pausing the simulation.

#### Acceptance Criteria

1. WHEN real-time mode processes turns, THE System SHALL append turn summaries to `turnHistory` exactly as in turn-based mode
2. WHEN events occur, THE System SHALL add them to `currentSimulationState.events` and display them in the Recent Events panel
3. WHILE real-time mode runs, THE System SHALL maintain the last 100 turn summaries in `turnHistory` (matching `maxTurnHistory`)
4. WHERE the user pauses real-time mode, THE System SHALL preserve all turn history and allow browsing through past turns
5. IF memory usage exceeds limits, THEN THE System SHALL prune old turn history while maintaining recent data

### Requirement 11: Error Handling and Recovery

**User Story:** As a user, I want real-time mode to handle errors gracefully, so that simulation issues don't crash the application or corrupt data.

#### Acceptance Criteria

1. WHEN `processTurn()` throws an error during real-time mode, THE System SHALL catch the error, log it, and stop real-time mode
2. WHEN LOD processing fails, THE System SHALL continue with JavaScript fallback and display a warning
3. WHILE errors occur, THE System SHALL preserve the last valid `currentSimulationState` to prevent data loss
4. WHERE multiple consecutive errors occur (>3), THE System SHALL stop real-time mode and display a detailed error report
5. IF state corruption is detected, THEN THE System SHALL offer to reset the simulation or load from the last checkpoint

### Requirement 12: WASM Package Marketing Integration

**User Story:** As a package maintainer, I want the real-time showcase to include clear calls-to-action for the npm package, so that interested users can easily find installation instructions and documentation.

#### Acceptance Criteria

1. WHEN viewing the performance dashboard, THE System SHALL display a prominent link to the npm package page
2. WHEN WASM provides significant speedup (>3x), THE System SHALL highlight this benefit with visual emphasis
3. WHILE demos run, THE System SHALL show code snippets demonstrating how to integrate the WASM package
4. WHERE users show interest, THE System SHALL provide a "Copy npm install command" button for quick integration
5. IF WASM is unavailable, THEN THE System SHALL explain the benefits and provide installation instructions

### Requirement 13: State Persistence and Recovery

**User Story:** As a user, I want real-time mode to work with the existing save/load system, so that I can save my simulation progress and resume later.

#### Acceptance Criteria

1. WHEN saving during real-time mode, THE System SHALL pause real-time processing, save the current state, and resume automatically
2. WHEN loading a saved world, THE System SHALL restore to turn-based mode by default and allow the user to enable real-time mode
3. WHILE real-time mode runs, THE System SHALL use the existing `LocalStorageWorldRepository` for periodic auto-saves
4. WHERE the user closes the browser during real-time mode, THE System SHALL save the current state before unload
5. IF state restoration fails, THEN THE System SHALL fall back to the last valid checkpoint and notify the user

### Requirement 14: Accessibility and Usability

**User Story:** As a user with accessibility needs, I want the real-time mode and performance dashboard to be fully accessible, so that I can evaluate the system regardless of my abilities.

#### Acceptance Criteria

1. WHEN using keyboard navigation, THE System SHALL allow full control of real-time mode (start, pause, speed adjustment) without a mouse
2. WHEN using screen readers, THE System SHALL announce performance metrics and mode changes with appropriate ARIA labels
3. WHILE animations run, THE System SHALL provide a "Reduce motion" option that minimizes visual effects
4. WHERE color is used to indicate performance, THE System SHALL also use icons and text labels for color-blind users
5. IF focus is lost during mode switching, THEN THE System SHALL restore focus to the appropriate control element
