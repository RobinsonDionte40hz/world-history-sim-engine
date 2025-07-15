# Design Document

## Overview

The turn counter system in the World History Simulation Engine currently has a disconnect between the backend simulation state (`worldState.time`) and the frontend UI display (`currentTick`). The backend properly increments `worldState.time` in the `RunTick` use case, but this value is not being synchronized with the UI components that display the turn counter.

The core issue is that the `WorldHistorySimInterface` component maintains its own local `currentTick` state that is never updated from the actual simulation state, while the `SimulationService` properly manages `worldState.time` but doesn't expose it to UI components in a way they can consume.

## Architecture

### Current State Analysis

**Backend (Working Correctly):**
- `SimulationService` manages the simulation loop and world state
- `RunTick` use case increments `worldState.time` on each tick
- State persistence includes the time value in localStorage
- State loading restores the time value correctly

**Frontend (Broken):**
- `WorldHistorySimInterface` has local `currentTick` state initialized to 0
- No connection between `worldState.time` and `currentTick`
- UI displays the local `currentTick` value which never changes
- `useSimulation` hook exists but isn't being used by the main interface

### Target Architecture

The solution involves creating a proper data flow from the simulation service to the UI components:

```
SimulationService.worldState.time → useSimulation hook → UI Components
```

## Components and Interfaces

### 1. SimulationService Enhancements

**Current Interface:**
```javascript
class SimulationService {
  worldState: { time: number, ... }
  onTick: (updatedState) => void
}
```

**Enhanced Interface:**
```javascript
class SimulationService {
  worldState: { time: number, ... }
  onTick: (updatedState) => void
  getCurrentTurn(): number  // New method to expose current turn
}
```

### 2. useSimulation Hook Integration

**Current State:**
- Hook exists but returns `worldState` and simulation controls
- Not being used by `WorldHistorySimInterface`

**Enhanced Integration:**
- Hook should expose `currentTurn` derived from `worldState.time`
- Hook should handle the synchronization automatically
- Components should use this hook instead of local state

### 3. UI Component Updates

**WorldHistorySimInterface Changes:**
- Remove local `currentTick` state
- Use `useSimulation` hook to get current turn
- Connect simulation controls to the service properly

**Display Components:**
- All turn counter displays should use the same source of truth
- Real-time updates when simulation is running

## Data Models

### World State Structure
```javascript
{
  time: number,           // Current turn/tick number (0-based)
  npcs: Character[],
  nodes: Node[],
  events: Event[],
  resources: Object,
  tickDelay: number       // Dynamic delay for next tick
}
```

### Turn Counter State Flow
```javascript
// Service Layer
SimulationService.worldState.time: number

// Hook Layer  
useSimulation() → { currentTurn: number, ... }

// UI Layer
Display: "Turn: {currentTurn}"
```

## Error Handling

### State Synchronization Errors
- **Invalid State Recovery:** If `worldState.time` is corrupted, reset to 0
- **Hook Connection Failures:** Fallback to displaying "Turn: --" if hook fails
- **Persistence Failures:** Continue simulation but log error if save fails

### Simulation Control Errors
- **Start/Stop Failures:** Ensure turn counter doesn't increment if simulation fails to start
- **Reset Failures:** Ensure turn counter resets to 0 even if other reset operations fail
- **Step Forward Failures:** Only increment turn counter if step operation succeeds

### UI Update Errors
- **Render Failures:** Graceful degradation if turn counter display fails
- **State Update Failures:** Prevent infinite re-render loops from state sync issues

## Testing Strategy

### Unit Tests
1. **SimulationService Tests:**
   - Verify `worldState.time` increments correctly on each tick
   - Test state persistence includes time value
   - Test state loading restores time value
   - Test `getCurrentTurn()` method returns correct value

2. **useSimulation Hook Tests:**
   - Verify hook returns current turn from world state
   - Test hook updates when simulation state changes
   - Test hook handles missing or invalid world state

3. **Component Tests:**
   - Test turn counter displays correct value from hook
   - Test turn counter updates in real-time during simulation
   - Test turn counter persists across component re-renders

### Integration Tests
1. **End-to-End Turn Counter Flow:**
   - Start simulation → verify turn counter increments
   - Stop/restart simulation → verify turn counter continues from last value
   - Reset simulation → verify turn counter resets to 0
   - Browser refresh → verify turn counter restores from localStorage

2. **Multi-Component Synchronization:**
   - Verify all UI components showing turn counter display same value
   - Test simultaneous updates across multiple components
   - Verify no race conditions in state updates

### Manual Testing Scenarios
1. **Basic Functionality:**
   - Start simulation and watch turn counter increment
   - Verify counter updates at expected intervals
   - Test pause/resume maintains correct count

2. **Persistence Testing:**
   - Run simulation for several turns
   - Refresh browser page
   - Verify turn counter shows correct value after reload

3. **Error Recovery:**
   - Corrupt localStorage data
   - Verify system recovers gracefully
   - Test with invalid world state data

## Implementation Notes

### Phase 1: Service Layer Updates
- Add `getCurrentTurn()` method to `SimulationService`
- Ensure consistent naming between `time` and turn counter concepts
- Verify state persistence and loading work correctly

### Phase 2: Hook Integration
- Update `useSimulation` hook to expose `currentTurn`
- Ensure hook properly subscribes to simulation state changes
- Add error handling for edge cases

### Phase 3: UI Component Updates
- Replace local `currentTick` state with hook-based state
- Update all turn counter displays to use consistent source
- Test real-time updates during simulation

### Phase 4: Testing and Validation
- Implement comprehensive test suite
- Perform manual testing across different scenarios
- Validate persistence and recovery behavior