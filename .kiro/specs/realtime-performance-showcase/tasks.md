# Implementation Plan

- [ ] 1. Enhance SimulationContext with real-time mode state and functions
  - Add real-time mode state variables (isRealTimeMode, realTimeSpeed, realTimeIntervalId, realTimeMetrics)
  - Implement startRealTimeMode(speed) function with setInterval logic
  - Implement stopRealTimeMode() function with clearInterval logic
  - Implement adjustRealTimeSpeed(newSpeed) function to change speed dynamically
  - Add metrics tracking logic (actualTPS, averageTurnTime, turnTimeHistory)
  - Update context value to expose real-time functions and state
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 2. Create ModeToggleControl component
  - Create new component in presentation/components/
  - Add mode toggle button (Turn-based ↔ Real-time)
  - Integrate with SimulationContext (isRealTimeMode, startRealTimeMode, stopRealTimeMode)
  - Add visual indicator for active real-time mode (animated dot, speed display)
  - Handle disabled states (can't start if simulation not ready)
  - Add appropriate styling with Tailwind CSS
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.4, 5.1, 5.2_

- [ ] 3. Create SpeedControlPanel component
  - Create new component in presentation/components/
  - Add preset speed buttons (1x, 2x, 5x, 10x, 25x)
  - Add custom speed slider (0.1 - 50 TPS)
  - Integrate with SimulationContext (adjustRealTimeSpeed, realTimeMetrics)
  - Add performance warning when actual TPS < 80% of target
  - Show target vs actual TPS comparison
  - Add appropriate styling with Tailwind CSS
  - _Requirements: 1.4, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 4. Create RealTimePerformanceDashboard component
  - Create new component in presentation/components/
  - Display actual TPS with color coding (green/yellow/red)
  - Display average turn processing time
  - Display total turns processed since real-time started
  - Display LOD processing metrics (averageTurnDuration)
  - Show LOD tier distribution (hero, group, background counts)
  - Show WASM status if available
  - Add appropriate styling with Tailwind CSS
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 5. Update WorldHistorySimInterface header
  - Import and add ModeToggleControl component to header
  - Update "Process Turn" button to disable when real-time mode is active
  - Update "Reset" button to disable when real-time mode is active
  - Ensure turn counter continues to update during real-time mode
  - Test header layout with new controls
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. Update WorldHistorySimInterface dashboard view
  - Add RealTimePerformanceDashboard to overview (conditional on isRealTimeMode)
  - Add SpeedControlPanel to overview (conditional on isRealTimeMode)
  - Ensure existing dashboard components continue to work during real-time mode
  - Test layout with real-time components visible
  - Verify all views (overview, timeline, statistics, characters) work in real-time mode
  - _Requirements: 5.3, 5.4, 5.5_

- [ ] 7. Add error handling for real-time mode
  - Wrap processTurn() call in try-catch within setInterval callback
  - Log errors to console with detailed information
  - Stop real-time mode automatically on error
  - Display error notification to user
  - Preserve last valid currentSimulationState on error
  - Add error recovery UI (retry button, error details)
  - _Requirements: 4.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 8. Add performance monitoring and warnings
  - Calculate actual TPS by measuring time between turn completions
  - Track turn processing time history (last 10 turns)
  - Display warning when actual TPS < 80% of target TPS
  - Suggest optimizations (reduce speed, reduce NPC count)
  - Add performance threshold indicators (green/yellow/red)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Verify LOD integration
  - Test that LOD pre-turn processing continues to work in real-time mode
  - Test that LOD post-turn processing continues to work in real-time mode
  - Verify LOD tier transitions are recorded during real-time mode
  - Verify WASM batch processing is used for group characters
  - Test with various NPC counts (50, 200, 500, 1000)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Add state persistence support
  - Verify turn history accumulates correctly during real-time mode
  - Verify events are added to currentSimulationState.events
  - Test that LocalStorageWorldRepository saves state correctly
  - Add auto-save during real-time mode (every N turns)
  - Test loading saved world and resuming in turn-based mode
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 11. Write unit tests for SimulationContext
  - Test startRealTimeMode() creates interval with correct delay
  - Test stopRealTimeMode() clears interval
  - Test adjustRealTimeSpeed() updates interval
  - Test metrics calculation (actualTPS, averageTurnTime)
  - Test error handling stops real-time mode
  - Test that processTurn() is called automatically
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 12. Write component tests
  - Test ModeToggleControl enables/disables correctly
  - Test SpeedControlPanel updates speed
  - Test RealTimePerformanceDashboard displays metrics
  - Test performance warnings appear at correct thresholds
  - Test UI updates when real-time mode starts/stops
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 13. Write integration tests
  - Test end-to-end real-time simulation (start, run, stop)
  - Test mode switching (turn-based → real-time → turn-based)
  - Test with various NPC counts (50, 200, 500)
  - Test speed adjustments during real-time mode
  - Test error recovery scenarios
  - Test state persistence and loading
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 14. Performance benchmarking
  - Benchmark 50 NPCs at 10 TPS (should maintain target)
  - Benchmark 200 NPCs at 10 TPS (9-10 TPS acceptable)
  - Benchmark 500 NPCs at 10 TPS (7-9 TPS acceptable)
  - Benchmark 1000 NPCs at 10 TPS (5-7 TPS acceptable)
  - Verify WASM provides expected speedup
  - Document performance characteristics
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Add accessibility features
  - Add keyboard shortcuts (space to toggle, +/- for speed)
  - Add ARIA labels for screen readers
  - Add focus management for mode switching
  - Add "Reduce motion" option for animations
  - Test with keyboard-only navigation
  - Test with screen reader
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 16. Documentation and polish
  - Update user documentation with real-time mode instructions
  - Add inline help text for speed controls
  - Create demo video showing real-time mode
  - Add marketing materials highlighting WASM performance
  - Update README with real-time mode features
  - Add troubleshooting guide for performance issues
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

