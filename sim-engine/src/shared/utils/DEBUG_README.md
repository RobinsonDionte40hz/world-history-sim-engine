# World Data Flow Debug Utilities

This directory contains debug utilities to help troubleshoot world data flow and state management issues in the World History Simulator.

## Quick Start

### Browser Console (Recommended)

The debug functions are automatically available in the browser console during development:

```javascript
// Quick debug - shows current state and localStorage
window.simpleDebugWorldFlow()

// Complete data flow analysis
window.debugWorldFlow()

// Test save/load cycle
await window.debugSaveLoadCycle()

// Debug specific world by ID
window.debugWorldById('world-id-123')

// Export all world data as JSON file
window.exportWorldData()

// Clear all world data (use with caution!)
window.clearAllWorldData()
```

### React Component

Add the debug panel to your app during development:

```javascript
import DebugPanel from './presentation/components/DebugPanel';

function App() {
  return (
    <div>
      {/* Your app content */}
      <DebugPanel />
    </div>
  );
}
```

### Initialize in App

Add to your main App.js or index.js:

```javascript
import { initDebugUtils } from './shared/utils/initDebugUtils';

// Initialize debug utilities (development only)
initDebugUtils();
```

## Available Functions

### `simpleDebugWorldFlow()`
Quick debug function that shows:
- Current editor state
- Stored worlds list
- Current world data in localStorage

### `debugWorldFlow()`
Comprehensive debug that shows:
- Complete editor state analysis
- localStorage data structure
- Data consistency checks
- WorldBuilder state
- All world-related storage keys

### `debugWorldById(id)`
Debug specific world:
- World data structure
- Validation results
- Completeness check

### `debugSaveLoadCycle()`
Tests the save/load cycle:
- Saves current world
- Loads it back
- Compares for consistency

### `clearAllWorldData()`
⚠️ **Use with caution!** Clears:
- All world data from localStorage
- Editor state
- WorldBuilder state

### `exportWorldData()`
Exports all world data as downloadable JSON file for backup/analysis.

## Common Debug Scenarios

### World Not Saving
```javascript
// Check current state
window.debugWorldFlow()

// Test save/load cycle
await window.debugSaveLoadCycle()
```

### Data Inconsistency
```javascript
// Check for differences between editor and storage
window.debugWorldFlow()

// Look for "Differences between editor state and stored data" warnings
```

### Missing World Data
```javascript
// Check specific world
window.debugWorldById('your-world-id')

// Check all stored worlds
window.simpleDebugWorldFlow()
```

### Performance Issues
```javascript
// Export data to analyze size
window.exportWorldData()

// Check number of stored keys
window.debugWorldFlow()
```

## Development Only

All debug utilities are automatically disabled in production builds. They only work when `NODE_ENV === 'development'`.

## Files

- `debugWorldFlow.js` - Main debug utilities
- `initDebugUtils.js` - Initialization helper
- `DebugPanel.js` - React component for UI controls
- `debugWorldFlow.test.js` - Tests for debug utilities
- `DEBUG_README.md` - This documentation

## Tips

1. **Use browser console** - Most convenient for quick debugging
2. **Check console output** - Debug functions log detailed information
3. **Export before clearing** - Always export data before using `clearAllWorldData()`
4. **Test save/load cycle** - Helps identify persistence issues
5. **Check data structure** - Use `debugWorldById()` to verify world completeness