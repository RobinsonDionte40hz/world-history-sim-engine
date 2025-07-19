# Test Refactoring Plan: Real-Time to Turn-Based Simulation

## Summary of Required Changes

### 1. Hook Interface Changes
**Old (Real-Time):**
```javascript
const { 
  isRunning, 
  canStart, 
  startSimulation, 
  stopSimulation, 
  stepSimulation 
} = useSimulation();
```

**New (Turn-Based):**
```javascript
const { 
  isInitialized, 
  canProcessTurn, 
  initializeWorld, 
  processTurn, 
  resetSimulation 
} = useSimulation(worldBuilderState);
```

### 2. Component Interface Changes
**Old UI Controls:**
- "Start Simulation" / "Stop Simulation" buttons
- `isRunning` state indicators
- Automatic turn progression

**New UI Controls:**
- "Process Turn" button
- `canProcessTurn` state indicators  
- Manual turn-by-turn progression

### 3. Test Pattern Changes

#### A. Initialization Tests
**Old Pattern:**
```javascript
// Just call useSimulation() and expect it to work
const { startSimulation } = useSimulation();
```

**New Pattern:**
```javascript
// Need proper world builder state for initialization
const mockWorldBuilderState = {
  isValid: true,
  stepValidation: [true, true, true, true, true, true, true],
  toSimulationConfig: () => ({ /* valid config */ })
};
const { initializeWorld } = useSimulation(mockWorldBuilderState);
```

#### B. Turn Progression Tests
**Old Pattern:**
```javascript
// Start simulation and wait for automatic progression
fireEvent.click(screen.getByText(/Start.*Simulation/));
await waitFor(() => {
  expect(turnCounter).toHaveTextContent('Turn: 3'); // Automatic
});
```

**New Pattern:**
```javascript
// Manually process each turn
for (let i = 1; i <= 3; i++) {
  fireEvent.click(screen.getByText(/Process Turn/));
  await waitFor(() => {
    expect(turnCounter).toHaveTextContent(`Turn: ${i}`);
  });
}
```

#### C. Persistence Tests  
**Old Pattern:**
```javascript
// Expected automatic localStorage saving during simulation
expect(localStorageMock.setItem).toHaveBeenCalledWith('worldState', ...);
```

**New Pattern:**
```javascript
// Mock SimulationService.loadState() to return test data
SimulationService.loadState = jest.fn(() => testData);
// Or trigger explicit save after turn processing
```

### 4. Files That Need Refactoring

1. **`turn-counter-integration-working.test.js`** ✅ (New version created)
2. **`turn-counter-integration.test.js`**
3. **`turn-counter-integration-comprehensive.test.js`**
4. **`turn-counter-integration-final.test.js`**
5. **`turn-counter-integration-focused.test.js`**
6. **`simulation-integration-test.js`**
7. **`simulation-service-turn-based.test.js`**

### 5. Mock Updates Needed

#### SimulationService Mocks
```javascript
// OLD mocks
SimulationService.start = jest.fn();
SimulationService.stop = jest.fn();
SimulationService.step = jest.fn();

// NEW mocks  
SimulationService.initialize = jest.fn();
SimulationService.processTurn = jest.fn();
SimulationService.reset = jest.fn();
SimulationService.loadState = jest.fn();
SimulationService.saveState = jest.fn();
```

### 6. Common Refactoring Steps

For each test file:

1. **Update imports and mocks**
   - Remove `startSimulation`, `stopSimulation`, `stepSimulation` 
   - Add `processTurn`, `initializeWorld`, proper world builder state

2. **Fix initialization patterns**
   - Add proper `worldBuilderState` for tests that need initialized simulation
   - Mock `SimulationService.loadState()` for persistence tests

3. **Update UI interaction tests**
   - Change button selectors from `/Start.*Simulation/` to `/Process Turn/`
   - Remove tests for `isRunning` state changes
   - Add tests for `canProcessTurn` state

4. **Fix turn progression expectations**
   - Remove automatic turn progression tests
   - Add manual turn processing tests
   - Update timing expectations (no more setTimeout/setInterval)

5. **Update error handling tests**
   - Test proper handling of invalid `getCurrentTurn()` returns (should show "--")
   - Test localStorage corruption handling (should show "0")
   - Test initialization failures

### 7. New Test Categories to Add

1. **World Builder Integration Tests**
   - Test that proper world builder state enables simulation
   - Test that invalid world builder state prevents simulation

2. **Manual Turn Processing Tests**
   - Test that `processTurn()` properly advances simulation
   - Test that multiple `processTurn()` calls work correctly
   - Test turn processing with different world states

3. **Initialization State Tests**
   - Test `canProcessTurn` logic
   - Test `isInitialized` state management
   - Test proper error states

## Next Steps

1. Run the new `turn-counter-integration-turnbased.test.js` to verify it works
2. Use it as a template to refactor the other test files one by one
3. Update any component tests that rely on the old simulation interface
4. Remove deprecated test files once new ones are working

Would you like me to help refactor specific test files or focus on particular test scenarios?
