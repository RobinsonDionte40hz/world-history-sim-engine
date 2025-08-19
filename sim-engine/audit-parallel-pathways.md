# Audit: Direct World Config to Simulation Pathways

## Summary
Multiple direct pathways exist where world configuration bypasses the intended SimulationContext gateway and preparation pipeline. This violates the architectural principle of strict separation between world building and simulation phases.

## Intended Architecture
According to SimulationContext.js documentation:
- SimulationContext should be the **exclusive entry point** for simulation-ready worlds
- Only accepts worlds processed through WorldBuilder preparation pipeline
- Requires `acceptPreparedWorld()` method as the sole gateway
- Validates simulation metadata (source: 'WorldBuilder', preparedAt timestamp)

## Violations Found

### 1. useSimulation Hook Direct Initialization
**File:** `sim-engine/src/presentation/hooks/useSimulation.js`
**Lines:** 72-99, 191-211

**Issues:**
- Directly accepts `worldBuilderState` parameter
- Calls `worldBuilderState.toSimulationConfig()` (line 75, 199)
- Directly initializes SimulationService without going through SimulationContext
- Bypasses the preparation pipeline validation

**Pattern:**
```javascript
const simulationConfig = worldBuilderState.toSimulationConfig();
const initializedState = SimulationService.initialize(simulationConfig);
```

### 2. WorldState toSimulationConfig Method
**File:** `sim-engine/src/domain/entities/WorldState.js`
**Lines:** 90-131

**Issues:**
- Provides direct conversion from world state to simulation config
- No validation for preparation pipeline
- No simulation metadata attached
- Allows any valid WorldState to be converted directly

### 3. SimulationService Direct Initialization
**File:** `sim-engine/src/application/use-cases/services/SimulationService.js`
**Lines:** 23-32

**Issues:**
- `initialize(config)` accepts raw configuration
- No validation that config came from proper pipeline
- Can be called directly without any context validation

### 4. SimulationControl Component
**File:** `sim-engine/src/presentation/features/SimulationControl.js`
**Lines:** 11-28

**Issues:**
- Directly uses SimulationService
- Bypasses SimulationContext entirely
- Loads state from localStorage without validation

### 5. Direct worldConfig Property Access
**Multiple Files:**

1. **EditorStateManager.js** (lines 192-222, 291-626)
   - Direct access: `this.worldBuilder.worldConfig`
   - Modifies world config directly

2. **CharacterEditorPage.js** (lines 79, 87, 265, 288, 1223, 1225)
   - Direct access: `currentWorld?.worldConfig?.interactions`
   - Direct access: `currentWorld.worldConfig?.characters`

3. **WorldStateViewer.js** (lines 28, 39, 48, 72, 215, 219, 223)
   - Direct access to worldConfig properties for display

4. **CharacterManager.js** (lines 132-134, 324-327)
   - Direct access: `worldBuilder.worldConfig?.nodePopulations`

### 6. SimulationContext Implementation Issue
**File:** `sim-engine/src/presentation/contexts/SimulationContext.js`
**Line:** 34

**Issue:**
- Uses `useSimulation(preparedWorldData)` which still allows the hook to directly initialize
- Should instead control initialization internally

## Impact

1. **Architecture Violation**: Multiple entry points to simulation violate single-gateway principle
2. **Validation Bypass**: World data can enter simulation without proper preparation
3. **Metadata Loss**: Direct paths don't attach required simulation metadata
4. **State Inconsistency**: Different initialization paths may produce different results
5. **Maintenance Burden**: Multiple paths to maintain and keep synchronized

## Recommended Refactoring

### Phase 1: Remove Direct Initialization Paths
1. Remove `toSimulationConfig()` method from WorldState
2. Remove direct worldBuilderState parameter from useSimulation hook
3. Make SimulationService.initialize() private or remove it

### Phase 2: Enforce SimulationContext Gateway
1. Update useSimulation to only work within SimulationContext
2. Remove direct SimulationService usage from components
3. Update SimulationContext to internally manage initialization

### Phase 3: Implement Proper Pipeline
1. Ensure all world data goes through WorldBuilder.prepareForSimulation()
2. Validate simulation metadata in all paths
3. Add integration tests to prevent regression

### Phase 4: Refactor Direct Access
1. Create read-only interfaces for world data access
2. Remove direct worldConfig property access
3. Implement proper data flow through contexts

## Proper Usage Pattern

The correct flow should be:
```
WorldBuilder.prepareForSimulation() 
    → SimulationContext.acceptPreparedWorld() 
    → Internal simulation initialization
```

Example from `ConditionalSimulationInterface.js`:
```javascript
const preparedWorldData = worldBuilder.prepareForSimulation();
const result = await simulationContext.acceptPreparedWorld(preparedWorldData);
```

## Files Requiring Changes

### Priority 1 - Core Architecture (Breaking Changes)
1. `useSimulation.js` - Remove direct initialization capability
2. `WorldState.js` - Remove toSimulationConfig method
3. `SimulationService.js` - Make initialize private/internal only

### Priority 2 - Component Updates
4. `SimulationControl.js` - Use SimulationContext instead of direct service
5. `MainPage.js` - Update to use proper context flow
6. Test files - Update to use proper initialization pattern

### Priority 3 - Data Access Refactoring
7. `EditorStateManager.js` - Remove direct worldConfig access
8. `CharacterEditorPage.js` - Use proper data access patterns
9. `WorldStateViewer.js` - Access world data through proper interfaces
10. `CharacterManager.js` - Remove direct worldConfig access

## Implementation Strategy

1. **Start with non-breaking changes**: Update components to use SimulationContext where available
2. **Add deprecation warnings**: Mark direct methods as deprecated before removal
3. **Update tests**: Ensure all tests use the proper initialization pattern
4. **Remove deprecated paths**: Once all usage is updated, remove the parallel pathways
5. **Add guards**: Implement runtime checks to prevent regression
