# Storage Resilience Enhancement - Tasks

## Overview

This document breaks down the Storage Resilience Enhancement initiative into actionable tasks organized by phase, priority, and dependencies. Each task includes acceptance criteria, estimated effort, and validation steps.

---

## Phase 1: Core Storage Infrastructure (Week 1)

### Task 1.1: Install and Configure Compression Library

**Priority**: HIGH  
**Effort**: 2 hours  
**Assignee**: TBD

**Description**: Install LZ-String compression library and verify it works with the project setup.

**Implementation**:
```bash
npm install --save lz-string
```

**Acceptance Criteria**:
- [ ] LZ-String installed successfully
- [ ] Library imports work in test environment
- [ ] Basic compression/decompression test passes
- [ ] No conflicts with existing dependencies

**Validation**:
```bash
# Test basic compression
node -e "const LZString = require('lz-string'); const test = 'Hello World'; const compressed = LZString.compressToUTF16(test); console.log('Compression ratio:', compressed.length / test.length);"
```

---

### Task 1.2: Implement CompressionService

**Priority**: CRITICAL  
**Effort**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Task 1.1

**Description**: Create the CompressionService that wraps LZ-String with performance monitoring and error handling.

**Files to Create**:
- `src/domain/services/CompressionService.js`
- `src/domain/services/__tests__/CompressionService.test.js`

**Acceptance Criteria**:
- [ ] CompressionService class created with compress() and decompress() methods
- [ ] Compression returns metadata (size, ratio, time)
- [ ] Decompression handles both wrapped and unwrapped data
- [ ] Error handling for corrupted compressed data
- [ ] Unit tests achieve 95%+ coverage
- [ ] Performance targets met (< 100ms for 1MB)

**Commands**:
```bash
# Run tests
npm test -- --testPathPattern=CompressionService

# Benchmark compression
node src/domain/services/__tests__/benchmark-compression.js
```

**Validation**:
- [ ] All unit tests pass
- [ ] Compression ratio > 50% on sample world data
- [ ] Compression time < 100ms for 1MB world

---

### Task 1.3: Implement LocalStorageAdapter

**Priority**: CRITICAL  
**Effort**: 8 hours  
**Assignee**: TBD  
**Dependencies**: None

**Description**: Create the LocalStorageAdapter with quota detection, metadata tracking, and error handling.

**Files to Create**:
- `src/infrastructure/storage/LocalStorageAdapter.js`
- `src/infrastructure/storage/__tests__/LocalStorageAdapter.test.js`

**Acceptance Criteria**:
- [ ] LocalStorageAdapter implements complete storage interface
- [ ] Quota exceeded errors are caught and reported with details
- [ ] Metadata (size, lastAccessed, lastModified) tracked for each world
- [ ] listWorlds() returns all saved worlds with metadata
- [ ] getSize() accurately calculates world storage size
- [ ] Unit tests cover all methods including error cases
- [ ] Mock localStorage used for testing

**Testing Strategy**:
```javascript
// Mock quota exceeded error
const mockLocalStorage = {
  setItem: jest.fn((key, value) => {
    if (value.length > 1000) {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    }
  })
};
```

**Validation**:
- [ ] All unit tests pass
- [ ] Quota exceeded error properly detected and reported
- [ ] Metadata persists across save/load cycles

---

### Task 1.4: Implement IndexedDBAdapter

**Priority**: HIGH  
**Effort**: 10 hours  
**Assignee**: TBD  
**Dependencies**: Task 1.3

**Description**: Create the IndexedDBAdapter as secondary storage fallback.

**Files to Create**:
- `src/infrastructure/storage/IndexedDBAdapter.js`
- `src/infrastructure/storage/__tests__/IndexedDBAdapter.test.js`

**Acceptance Criteria**:
- [ ] IndexedDBAdapter implements complete storage interface
- [ ] Database initialization creates object store with proper indexes
- [ ] Save/load operations work with large data (10MB+)
- [ ] Metadata tracked in separate object store
- [ ] Transaction error handling implemented
- [ ] Unit tests use fake-indexeddb for testing
- [ ] Browser compatibility checked (Chrome, Firefox, Safari, Edge)

**Implementation Notes**:
```javascript
// Database schema
const DB_NAME = 'worldHistorySimulator';
const DB_VERSION = 1;
const STORE_NAME = 'worlds';
const METADATA_STORE = 'metadata';

// Indexes
- worldId (unique)
- lastAccessed (for cleanup queries)
- size (for quota management)
```

**Validation**:
- [ ] All unit tests pass
- [ ] Can store and retrieve 10MB+ worlds
- [ ] Works in all target browsers

---

### Task 1.5: Implement FileSystemAdapter

**Priority**: MEDIUM  
**Effort**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Task 1.3

**Description**: Create the FileSystemAdapter for manual file export/import.

**Files to Create**:
- `src/infrastructure/storage/FileSystemAdapter.js`
- `src/infrastructure/storage/__tests__/FileSystemAdapter.test.js`

**Acceptance Criteria**:
- [ ] downloadFile() triggers browser download with proper filename
- [ ] uploadFile() reads and parses uploaded file
- [ ] Supports .whse (World History Simulation Engine) file format
- [ ] Files are compressed automatically
- [ ] Error handling for file read/write failures
- [ ] Unit tests cover download and upload flows

**Validation**:
- [ ] Can export and re-import a world without data loss
- [ ] Downloaded files are properly compressed
- [ ] Upload validates file format

---

### Task 1.6: Implement StorageMetricsCollector

**Priority**: MEDIUM  
**Effort**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Tasks 1.3, 1.4, 1.5

**Description**: Create service to collect storage usage metrics across all adapters.

**Files to Create**:
- `src/infrastructure/monitoring/StorageMetricsCollector.js`
- `src/infrastructure/monitoring/__tests__/StorageMetricsCollector.test.js`

**Acceptance Criteria**:
- [ ] collect() returns metrics for all storage adapters
- [ ] Metrics include: used, total, available, percentUsed, worldCount
- [ ] Per-world metrics: size, lastAccessed, compressed status
- [ ] Metrics calculation completes in < 50ms
- [ ] Browser-specific quota detection (Chrome vs Firefox vs Safari)

**Metrics Structure**:
```javascript
{
  localStorage: {
    used: 5242880,      // bytes
    total: 10485760,    // bytes
    available: 5242880, // bytes
    percentUsed: 0.5,
    worldCount: 3
  },
  indexedDB: {
    used: 0,
    total: null, // Unlimited in most browsers
    worldCount: 0
  },
  worlds: [
    {
      id: 'valley-of-echoes',
      size: 2097152,
      lastAccessed: 1697452800000,
      compressed: true,
      storage: 'localStorage'
    }
  ],
  timestamp: 1697452800000
}
```

**Validation**:
- [ ] Metrics accurate across all storage types
- [ ] Performance target met (< 50ms)

---

## Phase 2: StorageManager Implementation (Week 1-2)

### Task 2.1: Implement Core StorageManager

**Priority**: CRITICAL  
**Effort**: 12 hours  
**Assignee**: TBD  
**Dependencies**: Phase 1 complete

**Description**: Implement the main StorageManager orchestration service.

**Files to Create**:
- `src/application/services/StorageManager.js`
- `src/application/services/__tests__/StorageManager.test.js`

**Acceptance Criteria**:
- [ ] StorageManager coordinates all storage adapters
- [ ] initialize() sets up all adapters and metrics
- [ ] saveWorld() attempts storage with fallback chain
- [ ] loadWorld() searches all storage tiers
- [ ] Compression applied automatically when enabled
- [ ] Configuration options work correctly
- [ ] Unit tests cover all public methods
- [ ] Integration tests cover full save/load cycles

**Key Methods**:
```javascript
- async initialize()
- async saveWorld(worldId, worldState, options)
- async loadWorld(worldId, options)
- async exportWorld(worldId, options)
- async importWorld(file, options)
- async getStorageMetrics()
- async cleanupStaleWorlds(options)
```

**Validation**:
- [ ] All unit tests pass (target: 90% coverage)
- [ ] Integration tests pass
- [ ] Save/load cycle preserves data integrity

---

### Task 2.2: Implement Quota Recovery Logic

**Priority**: CRITICAL  
**Effort**: 8 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.1

**Description**: Implement automatic recovery strategies when localStorage quota is exceeded.

**Recovery Strategies** (in order):
1. Cleanup stale worlds (> 90 days old)
2. Consolidate delta saves to full snapshots
3. Trim old turn history from worlds
4. Fallback to IndexedDB
5. Fallback to file download

**Acceptance Criteria**:
- [ ] _attemptQuotaRecovery() implements all strategies
- [ ] Strategies execute in correct order
- [ ] Each strategy logs results
- [ ] Recovery success tracked in metrics
- [ ] User notified of recovery actions taken
- [ ] Integration tests simulate quota exceeded scenarios

**Test Scenario**:
```javascript
describe('Quota Recovery', () => {
  it('should recover from quota exceeded error', async () => {
    // Fill localStorage to capacity
    fillLocalStorage();
    
    // Attempt save that would exceed quota
    const result = await storageManager.saveWorld('large-world', largeWorldState);
    
    // Should succeed after recovery
    expect(result.success).toBe(true);
    expect(result.recovered).toBe(true);
    expect(result.strategy).toBeDefined();
  });
});
```

**Validation**:
- [ ] All recovery strategies tested
- [ ] 95%+ success rate in recovery tests
- [ ] User notifications work correctly

---

### Task 2.3: Implement Incremental Save System

**Priority**: MEDIUM  
**Effort**: 10 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.1

**Description**: Implement delta-based incremental saves to reduce storage usage.

**Implementation**:
- Track last full snapshot per world
- Calculate delta between current and snapshot
- Store deltas separately (up to 10)
- After 10 deltas, create new full snapshot
- On load, apply deltas to base snapshot

**Acceptance Criteria**:
- [ ] _calculateDelta() generates minimal diff
- [ ] _applyDelta() correctly reconstructs state
- [ ] Full snapshot created after 10 deltas
- [ ] Storage savings of 30%+ for typical usage
- [ ] Load time not significantly impacted (< 10% increase)
- [ ] Unit tests cover delta generation and application

**Delta Algorithm**:
```javascript
// Deep object diff
function calculateDelta(oldState, newState) {
  const delta = {
    changed: {},  // Modified values
    added: {},    // New properties
    removed: []   // Deleted properties
  };
  
  // Deep comparison logic
  // ...
  
  return delta;
}
```

**Validation**:
- [ ] Delta reconstruction matches original state
- [ ] Storage reduction target met (30%+)
- [ ] Performance acceptable

---

### Task 2.4: Implement ValidationService

**Priority**: HIGH  
**Effort**: 8 hours  
**Assignee**: TBD  
**Dependencies**: None

**Description**: Create schema validation service for world data integrity checking.

**Files to Create**:
- `src/domain/services/ValidationService.js`
- `src/domain/services/__tests__/ValidationService.test.js`
- `src/domain/schemas/WorldStateSchema.js`

**Acceptance Criteria**:
- [ ] validate() checks world state against schema
- [ ] Returns detailed validation results with errors
- [ ] Validates required fields (worldProperties, nodes, characters)
- [ ] Validates data types for all fields
- [ ] Validates nested structures (characters, nodes, settlements)
- [ ] Performance target met (< 500ms for 5MB world)
- [ ] Unit tests cover valid and invalid data

**Schema Example**:
```javascript
const WorldStateSchema = {
  worldProperties: {
    required: true,
    type: 'object',
    properties: {
      name: { required: true, type: 'string' },
      description: { required: false, type: 'string' },
      time: { required: true, type: 'number', min: 0 }
    }
  },
  characters: {
    required: true,
    type: 'array',
    items: { type: 'object', /* character schema */ }
  },
  nodes: {
    required: true,
    type: 'array',
    items: { type: 'object', /* node schema */ }
  }
};
```

**Validation**:
- [ ] All tests pass
- [ ] Validation catches common corruption patterns
- [ ] Performance acceptable

---

### Task 2.5: Implement Data Recovery Strategies

**Priority**: HIGH  
**Effort**: 10 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.4

**Description**: Implement automatic data recovery for corrupted world states.

**Recovery Strategies**:
1. Repair null values (replace with defaults)
2. Repair missing required fields (add defaults)
3. Load from backup (if available)
4. Reconstruct from history/deltas

**Acceptance Criteria**:
- [ ] Each recovery strategy implemented
- [ ] Strategies attempted in order until success
- [ ] Repaired data re-validated before returning
- [ ] Backup created before repair attempts
- [ ] User informed of recovery actions
- [ ] Unit tests simulate various corruption scenarios

**Test Scenarios**:
- Null character names
- Missing consciousness data
- Corrupted Map/Array structures
- Invalid timestamps
- Missing required fields

**Validation**:
- [ ] 95%+ recovery success rate
- [ ] No data loss during recovery
- [ ] User clearly informed of actions

---

## Phase 3: UI Integration (Week 2)

### Task 3.1: Create StorageIndicator Component

**Priority**: HIGH  
**Effort**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.1

**Description**: Create React component to display storage usage and warnings.

**Files to Create**:
- `src/presentation/components/StorageIndicator.jsx`
- `src/presentation/components/__tests__/StorageIndicator.test.jsx`
- `src/presentation/components/StorageIndicator.css`

**Acceptance Criteria**:
- [ ] Visual storage bar shows usage percentage
- [ ] Color indicates status (green/orange/red)
- [ ] Click to expand details (used/total/available)
- [ ] "Clean Up" button triggers cleanup
- [ ] Updates automatically every 30 seconds
- [ ] Listens for storage warning events
- [ ] Component tests cover all interactions

**Visual Design**:
```
┌────────────────────────────────────┐
│ Storage: ████████░░░░░░░░ 65%     │ ← Click to expand
├────────────────────────────────────┤
│ Used: 6.5 MB / 10 MB              │
│ Available: 3.5 MB                  │
│ [Clean Up Old Worlds]              │
└────────────────────────────────────┘
```

**Validation**:
- [ ] Component renders correctly
- [ ] Colors update based on thresholds
- [ ] All interactions work

---

### Task 3.2: Create Storage Warning Modal

**Priority**: HIGH  
**Effort**: 4 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.1

**Description**: Create modal dialog for storage warnings and critical alerts.

**Files to Create**:
- `src/presentation/components/StorageWarningModal.jsx`
- `src/presentation/components/__tests__/StorageWarningModal.test.jsx`

**Acceptance Criteria**:
- [ ] Modal displays on storage warning events
- [ ] Shows appropriate message based on severity
- [ ] Offers action buttons (Cleanup, Export, View Details, Dismiss)
- [ ] Critical alerts prevent dismissal without action
- [ ] Warning alerts can be dismissed
- [ ] Integrates with StorageManager actions

**Validation**:
- [ ] Modal appears on events
- [ ] Actions work correctly
- [ ] Can't dismiss critical alerts without action

---

### Task 3.3: Create World Management UI

**Priority**: MEDIUM  
**Effort**: 8 hours  
**Assignee**: TBD  
**Dependencies**: Task 2.1

**Description**: Create UI for viewing, exporting, and deleting saved worlds.

**Files to Create**:
- `src/presentation/pages/WorldManagement.jsx`
- `src/presentation/components/WorldListItem.jsx`

**Features**:
- List all saved worlds with metadata
- Show size, last accessed, and storage location
- Export individual worlds
- Delete worlds with confirmation
- Bulk operations (export all, delete selected)
- Sort by name, size, or last accessed

**Acceptance Criteria**:
- [ ] World list displays all worlds
- [ ] Metadata shown for each world
- [ ] Export functionality works
- [ ] Delete with confirmation works
- [ ] Sorting works correctly
- [ ] Bulk operations work

**Validation**:
- [ ] All CRUD operations work
- [ ] UI updates after operations
- [ ] Confirmations prevent accidental deletion

---

### Task 3.4: Integrate StorageManager with SimulationContext

**Priority**: CRITICAL  
**Effort**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Tasks 2.1, 3.1, 3.2

**Description**: Replace direct localStorage usage in SimulationContext with StorageManager.

**Files to Modify**:
- `src/presentation/contexts/SimulationContext.js`
- `src/infrastructure/Persistance/LocalStorageWorldRepository.js`

**Changes**:
```javascript
// SimulationContext.js
import { storageManager } from '../../application/services/StorageManager.js';

// Replace saveState() implementation
const saveState = async () => {
  const worldId = currentSimulationState?.worldProperties?.name || 'default';
  const result = await storageManager.saveWorld(worldId, currentSimulationState);
  
  if (!result.success) {
    // Handle error
    showError(result.error);
  }
};
```

**Acceptance Criteria**:
- [ ] SimulationContext uses StorageManager for all saves
- [ ] Loading uses StorageManager with fallback
- [ ] Error handling integrated
- [ ] Storage indicators update correctly
- [ ] Existing saved worlds load correctly (migration)
- [ ] All simulation tests pass

**Validation**:
- [ ] Full simulation save/load cycle works
- [ ] Turn processing persists correctly
- [ ] No regression in functionality

---

## Phase 4: Testing & Validation (Week 3)

### Task 4.1: Create Integration Test Suite

**Priority**: CRITICAL  
**Effort**: 12 hours  
**Assignee**: QA Lead  
**Dependencies**: All implementation tasks

**Description**: Comprehensive integration tests for storage resilience.

**Test Scenarios**:
1. **Normal Save/Load Cycle**
   - Save world → Load world → Verify integrity

2. **Quota Exceeded Recovery**
   - Fill localStorage → Save large world → Verify fallback

3. **Compression Effectiveness**
   - Save with/without compression → Compare sizes

4. **Incremental Save System**
   - Save world 10 times → Verify delta storage → Load → Verify integrity

5. **Data Corruption Recovery**
   - Corrupt saved data → Load → Verify recovery

6. **Multi-Tier Fallback**
   - Disable localStorage → Save → Verify IndexedDB used

7. **Export/Import Round-Trip**
   - Save world → Export → Clear storage → Import → Verify identity

8. **Stale World Cleanup**
   - Create old worlds → Trigger cleanup → Verify removal

**Acceptance Criteria**:
- [ ] All integration tests pass
- [ ] Test coverage > 85%
- [ ] All scenarios documented
- [ ] Performance benchmarks pass

**Commands**:
```bash
npm test -- --testPathPattern=storage-integration
node test-storage-resilience.js
```

---

### Task 4.2: Performance Benchmarking

**Priority**: HIGH  
**Effort**: 6 hours  
**Assignee**: TBD  
**Dependencies**: Task 4.1

**Description**: Benchmark storage operations against performance targets.

**Benchmarks**:
- Compress 1MB world (target: < 100ms)
- Decompress 1MB world (target: < 150ms)
- Save 5MB world (target: < 1s)
- Load 5MB world (target: < 2s)
- Collect metrics (target: < 50ms)
- Validate 5MB world (target: < 500ms)

**Acceptance Criteria**:
- [ ] All benchmarks meet or exceed targets
- [ ] Performance report generated
- [ ] No regressions from baseline

**Validation**:
```bash
node benchmark-storage.js
```

---

### Task 4.3: Cross-Browser Testing

**Priority**: HIGH  
**Effort**: 8 hours  
**Assignee**: QA Lead  
**Dependencies**: Task 4.1

**Description**: Test storage resilience across all supported browsers.

**Browsers to Test**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Test Cases**:
- localStorage quota limits vary by browser
- IndexedDB compatibility
- File download/upload
- Compression performance

**Acceptance Criteria**:
- [ ] All features work in all browsers
- [ ] Browser-specific issues documented
- [ ] Polyfills added where needed

---

### Task 4.4: User Acceptance Testing

**Priority**: MEDIUM  
**Effort**: 4 hours  
**Assignee**: Product Owner  
**Dependencies**: Tasks 4.1, 4.2, 4.3

**Description**: Conduct UAT with real users simulating large-world scenarios.

**Test Scenarios**:
- User creates large world (100+ NPCs)
- User hits storage quota and recovers
- User exports and imports world
- User cleans up old worlds

**Acceptance Criteria**:
- [ ] 90%+ user satisfaction
- [ ] Clear error messages understood by users
- [ ] Recovery actions successfully completed
- [ ] Feedback incorporated

---

## Phase 5: Documentation & Rollout (Week 3)

### Task 5.1: Update User Documentation

**Priority**: MEDIUM  
**Effort**: 4 hours  
**Assignee**: TBD  
**Dependencies**: All implementation complete

**Description**: Update user-facing documentation for storage features.

**Documents to Update**:
- `README.md` - Add storage management section
- `docs/StorageManagement.md` - New detailed guide
- FAQ - Add storage troubleshooting

**Content to Cover**:
- How storage works (localStorage, IndexedDB, export)
- Understanding storage indicators
- What to do when storage is full
- Exporting and importing worlds
- Managing old worlds

**Acceptance Criteria**:
- [ ] All docs updated
- [ ] Screenshots added
- [ ] Troubleshooting guide complete
- [ ] Team review completed

---

### Task 5.2: Update Developer Documentation

**Priority**: MEDIUM  
**Effort**: 3 hours  
**Assignee**: TBD  
**Dependencies**: All implementation complete

**Description**: Update developer documentation for storage architecture.

**Documents to Update**:
- `.github/copilot-instructions.md` - Add storage patterns
- `.kiro/steering/tech.md` - Update architecture
- `CONTRIBUTING.md` - Add storage development guidelines

**Acceptance Criteria**:
- [ ] Architecture diagrams updated
- [ ] API documentation complete
- [ ] Integration examples provided
- [ ] Review completed

---

### Task 5.3: Create Migration Guide

**Priority**: HIGH  
**Effort**: 4 hours  
**Assignee**: TBD  
**Dependencies**: All implementation complete

**Description**: Create guide for migrating existing saved worlds to new storage system.

**Migration Steps**:
1. Backup existing localStorage data
2. Enable new StorageManager
3. Auto-migrate on first load
4. Verify migration success
5. Clean up old storage keys

**Acceptance Criteria**:
- [ ] Migration guide written
- [ ] Auto-migration implemented
- [ ] Rollback procedure documented
- [ ] Testing completed

---

### Task 5.4: Gradual Rollout Plan

**Priority**: CRITICAL  
**Effort**: 2 hours  
**Assignee**: Tech Lead  
**Dependencies**: All tasks complete

**Description**: Plan gradual rollout with feature flags and monitoring.

**Rollout Phases**:
1. **Alpha** (10% of users): Enable compression only
2. **Beta** (25% of users): Enable full StorageManager
3. **GA** (100% of users): Default enabled

**Acceptance Criteria**:
- [ ] Feature flags implemented
- [ ] Rollback procedure documented
- [ ] Monitoring in place
- [ ] Success metrics defined

---

## Task Summary

| Phase | Tasks | Total Effort | Priority |
|-------|-------|--------------|----------|
| Phase 1: Core Infrastructure | 6 tasks | 36 hours | CRITICAL |
| Phase 2: StorageManager | 5 tasks | 48 hours | CRITICAL |
| Phase 3: UI Integration | 4 tasks | 24 hours | HIGH |
| Phase 4: Testing | 4 tasks | 30 hours | CRITICAL |
| Phase 5: Documentation & Rollout | 4 tasks | 13 hours | MEDIUM |
| **TOTAL** | **23 tasks** | **151 hours** | **~4 weeks** |

## Resource Allocation

**Recommended Team**:
- Lead Developer (Full-time, 3 weeks)
- Supporting Developer (Full-time, 2 weeks)
- QA Engineer (Full-time, 1 week for testing)
- UX Designer (Part-time, UI components)
- Tech Lead (Oversight, reviews)

## Success Metrics

1. **Zero Data Loss**: < 0.1% of saves result in data loss
2. **Quota Recovery**: 95%+ automatic recovery success rate
3. **Compression Ratio**: 50%+ average compression
4. **Performance**: All targets met (see benchmarks)
5. **User Satisfaction**: 90%+ positive feedback

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Performance regression | Benchmark continuously, optimize hot paths |
| Browser compatibility | Extensive cross-browser testing early |
| User confusion | Clear UI, comprehensive documentation |
| Data corruption | Multiple recovery strategies, backups |
| Migration failures | Thorough testing, rollback plan |
