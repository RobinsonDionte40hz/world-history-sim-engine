# Implementation Plan

- [x] 1. Enhance SimulationService with turn counter access method




  - Add `getCurrentTurn()` method that returns `worldState.time`
  - Add unit tests for the new method
  - Ensure method handles edge cases (null/undefined worldState)
  - _Requirements: 1.1, 3.1, 5.2_

- [x] 2. Update useSimulation hook to expose current turn





  - Modify hook to return `currentTurn` derived from `worldState.time`
  - Ensure hook updates when simulation state changes via onTick callback
  - Add error handling for invalid world state scenarios
  - Write unit tests for hook turn counter functionality
  - _Requirements: 1.3, 3.1, 3.2, 5.2_

- [x] 3. Fix WorldHistorySimInterface component turn counter integration





  - Remove local `currentTick` state management
  - Replace with `useSimulation` hook usage to get `currentTurn`
  - Update turn counter display to use hook-provided value
  - Ensure component re-renders when turn counter changes
  - _Requirements: 1.3, 3.2, 3.3, 4.1_

- [x] 4. Connect simulation controls to proper service methods





  - Update `toggleSimulation` to use `SimulationService.start()` and `SimulationService.stop()`
  - Update `resetSimulation` to properly reset world state and turn counter
  - Update `stepForward` to trigger single tick and update turn counter
  - Remove mock data initialization that overrides real simulation state
  - _Requirements: 1.1, 1.2, 1.4, 4.4_

- [x] 5. Implement turn counter persistence and loading










  - Verify `saveState()` includes time value in localStorage
  - Verify `loadState()` restores time value correctly
  - Add error handling for corrupted localStorage data
  - Test persistence across browser sessions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.3_

- [x] 6. Add comprehensive error handling for turn counter operations





  - Implement fallback display ("Turn: --") when state is unavailable
  - Add error boundaries for turn counter display components
  - Ensure simulation failures don't corrupt turn counter state
  - Add logging for turn counter related errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Create unit tests for turn counter functionality





  - Test SimulationService turn counter methods
  - Test useSimulation hook turn counter behavior
  - Test component turn counter display and updates
  - Test error handling scenarios
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [x] 8. Create integration tests for end-to-end turn counter flow





  - Test simulation start/stop/reset with turn counter updates
  - Test persistence and restoration of turn counter across sessions
  - Test synchronization between multiple UI components
  - Test real-time updates during simulation execution
  - _Requirements: 1.4, 2.1, 2.2, 3.3, 4.1_