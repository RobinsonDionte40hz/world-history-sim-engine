# WorldSaveManager - Integrated World Saving System

## Overview

The WorldSaveManager provides a seamless bridge between the EditorStateManager and WorldPersistenceService, solving the integration gap that previously existed in the world saving process. It orchestrates the complete save/load flow with proper state management, error handling, and user feedback.

## Problem Solved

Previously, the world saving process required manual coordination between multiple services:

```javascript
// OLD: Manual coordination required
const worldData = editorStateManager.getEditorData('world');
const savedWorld = await worldPersistenceService.saveWorld(worldData);
editorStateManager.setCurrentWorld(savedWorld);
editorStateManager.setSaveStatus('saved');
editorStateManager.setUnsavedChanges(false);
```

Now, the WorldSaveManager handles this entire flow automatically:

```javascript
// NEW: Single integrated call
const savedWorld = await worldSaveManager.saveWorld();
```

## Architecture

### Core Components

1. **WorldSaveManager** - Main orchestrator service
2. **useWorldSave** - React hook for UI integration
3. **SaveStatusIndicator** - Visual status component
4. **WorldEditor** - Example implementation

### Integration Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ EditorStateManager │◄──►│ WorldSaveManager │◄──►│ WorldPersistenceService │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
         ▲                        ▲                         ▲
         │                        │                         │
         ▼                        ▼                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   UI Components   │    │   React Hooks    │    │    localStorage     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

## API Reference

### WorldSaveManager

#### Core Methods

```javascript
// Save current world with full state management
await worldSaveManager.saveWorld(options = {})

// Load world and populate editor state
await worldSaveManager.loadWorld(worldId)

// Create new world with proper initialization
await worldSaveManager.createNewWorld(worldData)

// Delete world with state cleanup
await worldSaveManager.deleteWorld(worldId)

// Save individual node with state coordination
await worldSaveManager.saveNode(worldId, nodeData)
```

#### Status Methods

```javascript
// Check if world can be saved
worldSaveManager.canSaveWorld()

// Get comprehensive save status
worldSaveManager.getSaveStatus()
```

#### Auto-Save Controls

```javascript
// Enable auto-save with optional delay
worldSaveManager.enableAutoSave(delay = 30000)

// Disable auto-save
worldSaveManager.disableAutoSave()

// Manually trigger auto-save
await worldSaveManager.triggerAutoSave()
```

### useWorldSave Hook

```javascript
const {
  // Status
  saveStatus,
  isLoading,
  error,
  lastSaveTime,
  
  // Actions
  saveWorld,
  loadWorld,
  createNewWorld,
  deleteWorld,
  triggerSave,
  
  // Auto-save controls
  enableAutoSave,
  disableAutoSave,
  
  // Utilities
  clearError,
  
  // Computed values
  canSave,
  hasUnsavedChanges,
  isSaving,
  autoSaveEnabled
} = useWorldSave();
```

## Usage Examples

### Basic World Saving

```javascript
import { useWorldSave } from '../hooks/useWorldSave';

const MyComponent = () => {
  const { saveWorld, canSave, isSaving, error } = useWorldSave();
  
  const handleSave = async () => {
    try {
      await saveWorld();
      console.log('World saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };
  
  return (
    <button 
      onClick={handleSave}
      disabled={!canSave || isSaving}
    >
      {isSaving ? 'Saving...' : 'Save World'}
    </button>
  );
};
```

### Auto-Save Implementation

```javascript
const WorldEditor = () => {
  const { enableAutoSave, autoSaveEnabled, lastSaveTime } = useWorldSave();
  
  useEffect(() => {
    // Enable auto-save on mount
    enableAutoSave(30000); // 30 seconds
  }, [enableAutoSave]);
  
  return (
    <div>
      <p>Auto-save: {autoSaveEnabled ? 'Enabled' : 'Disabled'}</p>
      <p>Last saved: {lastSaveTime?.toLocaleString() || 'Never'}</p>
    </div>
  );
};
```

### Complete Save Status Display

```javascript
import SaveStatusIndicator from '../components/SaveStatusIndicator';

const App = () => {
  return (
    <div>
      <h1>World Editor</h1>
      <SaveStatusIndicator 
        showAutoSaveToggle={true}
        showManualSave={true}
        compact={false}
      />
      {/* Your editor content */}
    </div>
  );
};
```

## Event System

The WorldSaveManager emits events for integration with other systems:

```javascript
// Listen for save events
worldSaveManager.on('saveStarted', () => {
  console.log('Save process started');
});

worldSaveManager.on('saveCompleted', (worldData) => {
  console.log('Save completed:', worldData);
});

worldSaveManager.on('saveError', (error) => {
  console.error('Save failed:', error);
});

worldSaveManager.on('autoSaveCompleted', () => {
  console.log('Auto-save completed');
});

// Load events
worldSaveManager.on('loadStarted', (worldId) => {
  console.log('Loading world:', worldId);
});

worldSaveManager.on('loadCompleted', (worldData) => {
  console.log('Load completed:', worldData);
});

// World management events
worldSaveManager.on('worldCreated', (worldData) => {
  console.log('New world created:', worldData);
});

worldSaveManager.on('worldDeleted', (worldId) => {
  console.log('World deleted:', worldId);
});
```

## Error Handling

The system provides comprehensive error handling:

```javascript
const { saveWorld, error, clearError } = useWorldSave();

const handleSave = async () => {
  try {
    await saveWorld();
  } catch (error) {
    // Error is automatically captured in the hook
    // Display error to user
    if (error.message.includes('validation')) {
      alert('Please fill in all required fields');
    } else {
      alert('Save failed. Please try again.');
    }
  }
};

// Clear error when user acknowledges it
const handleErrorDismiss = () => {
  clearError();
};
```

## State Management Integration

The WorldSaveManager seamlessly integrates with the existing EditorStateManager:

```javascript
// The save process automatically:
// 1. Collects data from all editors (world, nodes, characters, interactions)
// 2. Validates the data structure
// 3. Saves to persistence layer
// 4. Updates current world reference
// 5. Resets unsaved changes flag
// 6. Sets appropriate save status

// Example of what happens internally:
const saveWorld = async () => {
  // 1. Get world data from EditorStateManager
  const worldData = this._collectWorldData();
  
  // 2. Save to persistence service
  const savedWorld = await worldPersistenceService.saveWorld(worldData);
  
  // 3. Update current world reference
  editorStateManager.setCurrentWorld(savedWorld);
  
  // 4. Reset unsaved changes flag
  editorStateManager.setUnsavedChanges(false);
  
  // 5. Set save status
  editorStateManager.setSaveStatus('saved');
  
  return savedWorld;
};
```

## Testing

The system includes comprehensive tests covering:

- Basic functionality and singleton behavior
- Complete save/load flows
- Error handling scenarios
- Auto-save functionality
- Event emission
- Integration with existing services

Run tests with:

```bash
npm test -- --testPathPattern=WorldSaveManager.test.js
```

## Performance Considerations

### Auto-Save Optimization

- Auto-save uses debouncing to prevent excessive saves
- Only triggers when there are actual unsaved changes
- Respects save-in-progress state to prevent conflicts

### Memory Management

- Event listeners are properly cleaned up in React components
- localStorage operations are batched where possible
- Large world data is handled efficiently

### Error Recovery

- Failed saves don't corrupt existing data
- Partial saves are rolled back on error
- User can retry failed operations

## Migration Guide

### From Manual Coordination

If you're currently using manual coordination between services:

```javascript
// OLD
const worldData = editorStateManager.getEditorData('world');
editorStateManager.setSaveStatus('saving');
try {
  const savedWorld = await worldPersistenceService.saveWorld(worldData);
  editorStateManager.setCurrentWorld(savedWorld);
  editorStateManager.setUnsavedChanges(false);
  editorStateManager.setSaveStatus('saved');
} catch (error) {
  editorStateManager.setSaveStatus('error');
  throw error;
}

// NEW
const savedWorld = await worldSaveManager.saveWorld();
```

### In React Components

Replace direct service calls with the hook:

```javascript
// OLD
import editorStateManager from '../services/EditorStateManager';
import worldPersistenceService from '../services/WorldPersistenceService';

// NEW
import { useWorldSave } from '../hooks/useWorldSave';
```

## Best Practices

1. **Use the Hook**: Always use `useWorldSave` in React components rather than calling services directly
2. **Handle Errors**: Always handle errors from save operations gracefully
3. **Show Status**: Use `SaveStatusIndicator` to keep users informed
4. **Enable Auto-Save**: Consider enabling auto-save for better user experience
5. **Test Integration**: Test your components with the integrated save system

## Future Enhancements

Planned improvements include:

- Conflict resolution for concurrent edits
- Offline save capabilities
- Save history and versioning
- Bulk operations for multiple worlds
- Export/import integration
- Cloud storage backends

## Troubleshooting

### Common Issues

**Save not working**: Check that world has required name and description fields
**Auto-save not triggering**: Ensure auto-save is enabled and there are unsaved changes
**Load failing**: Verify the world ID exists in localStorage
**State not updating**: Make sure you're using the `useWorldSave` hook correctly

### Debug Mode

Enable debug logging:

```javascript
worldSaveManager.on('saveStarted', () => console.log('Save started'));
worldSaveManager.on('saveCompleted', (world) => console.log('Save completed:', world));
worldSaveManager.on('saveError', (error) => console.error('Save error:', error));
```

This integrated system provides a robust, user-friendly solution for world saving that eliminates the previous coordination complexity while adding powerful features like auto-save and comprehensive error handling.