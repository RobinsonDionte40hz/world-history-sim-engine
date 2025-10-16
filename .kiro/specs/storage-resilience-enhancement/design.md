# Storage Resilience Enhancement - Design Document

## Overview

The Storage Resilience Enhancement introduces a comprehensive storage management system for the World History Simulation Engine. This design addresses critical gaps in storage quota handling, data compression, fallback mechanisms, and data integrity validation. The solution employs a multi-layered architecture with automatic failover, proactive monitoring, and intelligent cleanup strategies to ensure data safety at scale.

The core innovation is the **StorageManager** service that coordinates between multiple storage backends (localStorage, IndexedDB, File System), handles compression transparently, monitors usage, and provides automatic recovery from storage failures.

## Architecture

### High-Level Architecture

```
Storage Layer Architecture:
├── Application Layer
│   └── StorageManager (Orchestration Service)
│       ├── Quota Management
│       ├── Compression Strategy
│       ├── Fallback Coordination
│       └── Monitoring & Metrics
├── Storage Adapters Layer
│   ├── LocalStorageAdapter (Primary)
│   ├── IndexedDBAdapter (Secondary)
│   └── FileSystemAdapter (Tertiary)
├── Utilities Layer
│   ├── CompressionService (LZ-String)
│   ├── ValidationService (Schema Validation)
│   └── MigrationService (Version Compatibility)
└── Infrastructure Layer
    ├── StorageMetricsCollector
    ├── DataIntegrityChecker
    └── CleanupScheduler

Data Flow:
User → StorageManager → CompressionService → StorageAdapter → Browser Storage
User ← StorageManager ← ValidationService ← StorageAdapter ← Browser Storage
```

### Storage Tier Priority

```
Save Operation Flow:
1. Try LocalStorageAdapter (Primary)
   ├── Success → Done
   └── Failure (Quota) → Try Compression + Cleanup → Retry
       └── Still Fails → Try IndexedDBAdapter (Secondary)
           ├── Success → Notify User (Storage Degraded)
           └── Failure → Try FileSystemAdapter (Tertiary/Manual)
               ├── Success → Notify User (Manual Backup Required)
               └── Failure → Keep in Memory + Critical Alert

Load Operation Flow:
1. Check all storage tiers for world data
2. Load most recent version (by timestamp)
3. Validate and decompress
4. If validation fails → Attempt recovery
5. If recovery fails → Offer user recovery options
```

## Core Components

### 1. StorageManager (Application Service)

**Purpose**: Central orchestration for all storage operations.

```javascript
// src/application/services/StorageManager.js

import LocalStorageAdapter from '../../infrastructure/storage/LocalStorageAdapter.js';
import IndexedDBAdapter from '../../infrastructure/storage/IndexedDBAdapter.js';
import FileSystemAdapter from '../../infrastructure/storage/FileSystemAdapter.js';
import CompressionService from '../../domain/services/CompressionService.js';
import ValidationService from '../../domain/services/ValidationService.js';
import StorageMetricsCollector from '../../infrastructure/monitoring/StorageMetricsCollector.js';

class StorageManager {
  constructor(options = {}) {
    // Initialize storage adapters in priority order
    this.adapters = [
      new LocalStorageAdapter({ maxSize: options.localStorageMaxSize || 10 * 1024 * 1024 }),
      new IndexedDBAdapter({ dbName: 'worldHistorySimulator', storeName: 'worlds' }),
      new FileSystemAdapter({ downloadsPath: options.downloadsPath || 'world-saves' })
    ];

    // Services
    this.compressionService = new CompressionService();
    this.validationService = new ValidationService();
    this.metricsCollector = new StorageMetricsCollector();

    // Configuration
    this.config = {
      enableCompression: options.enableCompression !== false,
      enableIncrementalSave: options.enableIncrementalSave !== false,
      enableAutoCleanup: options.enableAutoCleanup !== false,
      maxDeltaSaves: options.maxDeltaSaves || 10,
      staleWorldDays: options.staleWorldDays || 90,
      warningThreshold: options.warningThreshold || 0.7,
      criticalThreshold: options.criticalThreshold || 0.9
    };

    // State
    this.lastFullSnapshot = new Map(); // World ID -> Snapshot
    this.deltaCount = new Map(); // World ID -> Delta Count
    this.storageMetrics = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Initialize storage adapters
    for (const adapter of this.adapters) {
      try {
        await adapter.initialize();
      } catch (error) {
        console.warn(`Failed to initialize ${adapter.name}:`, error);
      }
    }

    // Collect initial metrics
    await this.updateMetrics();

    // Setup automatic cleanup if enabled
    if (this.config.enableAutoCleanup) {
      this.scheduleAutoCleanup();
    }

    this.initialized = true;
  }

  async saveWorld(worldId, worldState, options = {}) {
    if (!this.initialized) await this.initialize();

    const saveOptions = {
      forceFullSnapshot: options.forceFullSnapshot || false,
      skipCompression: options.skipCompression || false,
      priority: options.priority || 'normal'
    };

    try {
      // Determine save strategy (full vs incremental)
      const saveData = this._prepareSaveData(worldId, worldState, saveOptions);

      // Compress if enabled
      const finalData = saveOptions.skipCompression || !this.config.enableCompression
        ? saveData
        : await this.compressionService.compress(saveData);

      // Attempt save through adapters
      const result = await this._attemptSaveWithFallback(worldId, finalData, saveOptions);

      // Update metrics
      await this.updateMetrics();

      // Check for warnings
      this._checkStorageWarnings();

      return result;

    } catch (error) {
      // Handle critical failure
      return this._handleCriticalSaveFailure(worldId, worldState, error);
    }
  }

  async loadWorld(worldId, options = {}) {
    if (!this.initialized) await this.initialize();

    try {
      // Search all storage tiers
      const worldData = await this._findWorldInStorage(worldId);

      if (!worldData) {
        throw new Error(`World ${worldId} not found in any storage tier`);
      }

      // Decompress if needed
      const decompressed = worldData.compressed
        ? await this.compressionService.decompress(worldData.data)
        : worldData.data;

      // Validate
      const validation = await this.validationService.validate(decompressed);

      if (!validation.valid) {
        // Attempt recovery
        return await this._attemptDataRecovery(worldId, decompressed, validation);
      }

      // Apply incremental saves if present
      const finalState = worldData.hasDeltas
        ? this._applyDeltas(decompressed, worldData.deltas)
        : decompressed;

      // Update access time
      await this._updateWorldAccessTime(worldId);

      return {
        success: true,
        worldState: finalState,
        source: worldData.source,
        metadata: worldData.metadata
      };

    } catch (error) {
      return this._handleCriticalLoadFailure(worldId, error);
    }
  }

  async getStorageMetrics() {
    if (!this.storageMetrics || this._metricsStale()) {
      await this.updateMetrics();
    }
    return this.storageMetrics;
  }

  async updateMetrics() {
    this.storageMetrics = await this.metricsCollector.collect(this.adapters);
    this.storageMetrics.timestamp = Date.now();
    return this.storageMetrics;
  }

  async exportWorld(worldId, options = {}) {
    const worldData = await this.loadWorld(worldId);
    
    if (!worldData.success) {
      throw new Error(`Cannot export world: ${worldData.error}`);
    }

    const exportData = {
      version: '1.0',
      worldId,
      worldState: worldData.worldState,
      metadata: {
        exportDate: Date.now(),
        engineVersion: options.engineVersion || 'unknown',
        includeHistory: options.includeHistory !== false
      }
    };

    // Optionally strip history to reduce size
    if (!options.includeHistory) {
      delete exportData.worldState.turnHistory;
      delete exportData.worldState.events;
    }

    // Compress for export
    const compressed = await this.compressionService.compress(JSON.stringify(exportData));

    // Trigger download via FileSystemAdapter
    return this.adapters.find(a => a.name === 'FileSystem').downloadFile(
      `${worldId}-${Date.now()}.whse`,
      compressed
    );
  }

  async importWorld(file, options = {}) {
    try {
      // Read file
      const fileContent = await this._readFile(file);

      // Decompress
      const decompressed = await this.compressionService.decompress(fileContent);
      const importData = JSON.parse(decompressed);

      // Validate import format
      if (!importData.version || !importData.worldState) {
        throw new Error('Invalid world import file format');
      }

      // Migrate if needed
      if (importData.version !== '1.0') {
        importData.worldState = await this._migrateWorldData(
          importData.worldState,
          importData.version,
          '1.0'
        );
      }

      // Validate world data
      const validation = await this.validationService.validate(importData.worldState);
      if (!validation.valid) {
        throw new Error(`Invalid world data: ${validation.errors.join(', ')}`);
      }

      // Save to storage
      const worldId = importData.worldId || `imported-${Date.now()}`;
      await this.saveWorld(worldId, importData.worldState, { forceFullSnapshot: true });

      return {
        success: true,
        worldId,
        metadata: importData.metadata
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }

  async cleanupStaleWorlds(options = {}) {
    const staleThreshold = Date.now() - (this.config.staleWorldDays * 24 * 60 * 60 * 1000);
    const protectRecent = options.protectRecent || 5;

    const allWorlds = await this._getAllWorldMetadata();
    
    // Sort by last access time
    allWorlds.sort((a, b) => b.lastAccessed - a.lastAccessed);

    const staleWorlds = allWorlds
      .slice(protectRecent) // Protect most recent
      .filter(w => w.lastAccessed < staleThreshold);

    if (staleWorlds.length === 0) {
      return { cleaned: 0, freed: 0 };
    }

    // Offer user choice if not forced
    if (!options.force) {
      const userConsent = await this._requestCleanupConsent(staleWorlds);
      if (!userConsent) {
        return { cleaned: 0, freed: 0, cancelled: true };
      }
    }

    // Archive stale worlds before deletion
    let freedSpace = 0;
    for (const world of staleWorlds) {
      if (options.archive) {
        await this.exportWorld(world.id, { includeHistory: false });
      }

      const size = await this._getWorldSize(world.id);
      await this._deleteWorld(world.id);
      freedSpace += size;
    }

    return {
      cleaned: staleWorlds.length,
      freed: freedSpace,
      archived: options.archive
    };
  }

  // Private helper methods

  _prepareSaveData(worldId, worldState, options) {
    if (options.forceFullSnapshot || !this.config.enableIncrementalSave) {
      // Full snapshot
      this.lastFullSnapshot.set(worldId, worldState);
      this.deltaCount.set(worldId, 0);
      
      return {
        type: 'full',
        worldId,
        timestamp: Date.now(),
        data: worldState
      };
    }

    // Incremental save (delta)
    const lastSnapshot = this.lastFullSnapshot.get(worldId);
    const deltasSinceSnapshot = this.deltaCount.get(worldId) || 0;

    if (!lastSnapshot || deltasSinceSnapshot >= this.config.maxDeltaSaves) {
      // Time for new full snapshot
      this.lastFullSnapshot.set(worldId, worldState);
      this.deltaCount.set(worldId, 0);
      
      return {
        type: 'full',
        worldId,
        timestamp: Date.now(),
        data: worldState
      };
    }

    // Calculate delta
    const delta = this._calculateDelta(lastSnapshot, worldState);
    this.deltaCount.set(worldId, deltasSinceSnapshot + 1);

    return {
      type: 'delta',
      worldId,
      timestamp: Date.now(),
      baseSn apshot: this.lastFullSnapshot.get(worldId).timestamp,
      delta
    };
  }

  async _attemptSaveWithFallback(worldId, data, options) {
    const results = [];

    for (const adapter of this.adapters) {
      try {
        await adapter.save(worldId, data, options);
        
        return {
          success: true,
          adapter: adapter.name,
          size: JSON.stringify(data).length,
          compressed: data.compressed || false
        };

      } catch (error) {
        results.push({
          adapter: adapter.name,
          error: error.message,
          code: error.code
        });

        // Handle quota exceeded specifically
        if (error.name === 'QuotaExceededError' && adapter.name === 'LocalStorage') {
          // Attempt recovery
          const recovered = await this._attemptQuotaRecovery(worldId, data);
          if (recovered) {
            // Retry with same adapter
            try {
              await adapter.save(worldId, data, options);
              return {
                success: true,
                adapter: adapter.name,
                recovered: true
              };
            } catch (retryError) {
              // Continue to next adapter
              continue;
            }
          }
        }

        // Continue to next adapter
        continue;
      }
    }

    // All adapters failed
    throw new Error(`All storage adapters failed: ${JSON.stringify(results)}`);
  }

  async _attemptQuotaRecovery(worldId, data) {
    // Strategy 1: Cleanup stale worlds
    const cleanupResult = await this.cleanupStaleWorlds({ force: true, archive: true });
    
    if (cleanupResult.freed > data.length) {
      return true; // Enough space freed
    }

    // Strategy 2: Remove old deltas and force full snapshots
    await this._consolidateDeltas();

    // Strategy 3: Remove turn history from old worlds
    await this._trimOldWorldHistory();

    // Check if we have enough space now
    const metrics = await this.updateMetrics();
    return metrics.localStorage.percentUsed < this.config.criticalThreshold;
  }

  async _findWorldInStorage(worldId) {
    for (const adapter of this.adapters) {
      try {
        const data = await adapter.load(worldId);
        if (data) {
          return {
            data,
            source: adapter.name,
            metadata: await adapter.getMetadata(worldId)
          };
        }
      } catch (error) {
        console.warn(`Failed to load from ${adapter.name}:`, error);
        continue;
      }
    }
    return null;
  }

  async _attemptDataRecovery(worldId, corruptedData, validation) {
    const recoveryStrategies = [
      this._repairNullValues.bind(this),
      this._repairMissingFields.bind(this),
      this._loadFromBackup.bind(this),
      this._reconstructFromHistory.bind(this)
    ];

    for (const strategy of recoveryStrategies) {
      try {
        const repaired = await strategy(worldId, corruptedData, validation);
        
        // Validate repaired data
        const revalidation = await this.validationService.validate(repaired);
        
        if (revalidation.valid) {
          // Save repaired version
          await this.saveWorld(worldId, repaired, { forceFullSnapshot: true });
          
          return {
            success: true,
            worldState: repaired,
            recovered: true,
            method: strategy.name
          };
        }
      } catch (error) {
        console.warn(`Recovery strategy ${strategy.name} failed:`, error);
        continue;
      }
    }

    // All recovery failed
    throw new Error('Data recovery failed for all strategies');
  }

  _handleCriticalSaveFailure(worldId, worldState, error) {
    // Keep data in memory as last resort
    if (!this.memoryBackup) {
      this.memoryBackup = new Map();
    }
    
    this.memoryBackup.set(worldId, {
      worldState,
      timestamp: Date.now(),
      error: error.message
    });

    // Notify user
    this._showCriticalAlert({
      type: 'save_failure',
      message: 'Failed to save world to any storage. Data kept in memory.',
      actions: ['Export Now', 'Retry', 'Clear Space'],
      worldId
    });

    return {
      success: false,
      error: error.message,
      inMemory: true,
      worldId
    };
  }

  _handleCriticalLoadFailure(worldId, error) {
    // Notify user with recovery options
    this._showCriticalAlert({
      type: 'load_failure',
      message: `Failed to load world: ${error.message}`,
      actions: ['Import Backup', 'View Raw Data', 'Reset'],
      worldId
    });

    return {
      success: false,
      error: error.message,
      worldId
    };
  }

  _checkStorageWarnings() {
    if (!this.storageMetrics) return;

    const { localStorage } = this.storageMetrics;

    if (localStorage.percentUsed >= this.config.criticalThreshold) {
      this._showStorageWarning({
        level: 'critical',
        percentUsed: localStorage.percentUsed,
        message: 'Storage critically full! Clean up worlds to prevent data loss.',
        actions: ['Cleanup Now', 'Export Worlds', 'View Details']
      });
    } else if (localStorage.percentUsed >= this.config.warningThreshold) {
      this._showStorageWarning({
        level: 'warning',
        percentUsed: localStorage.percentUsed,
        message: 'Storage getting full. Consider cleaning up old worlds.',
        actions: ['View Details', 'Cleanup', 'Dismiss']
      });
    }
  }

  _showStorageWarning(warning) {
    // Emit event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storageWarning', {
        detail: warning
      }));
    }
  }

  _showCriticalAlert(alert) {
    // Emit event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storageCriticalAlert', {
        detail: alert
      }));
    }
  }

  _calculateDelta(oldState, newState) {
    // Deep diff algorithm
    const delta = {
      changed: {},
      added: {},
      removed: {}
    };

    // Implementation of deep comparison and delta generation
    // This is a placeholder for the actual algorithm
    
    return delta;
  }

  _applyDeltas(baseState, deltas) {
    let currentState = baseState;
    
    for (const delta of deltas) {
      currentState = this._applyDelta(currentState, delta);
    }
    
    return currentState;
  }

  _applyDelta(state, delta) {
    // Apply delta to state
    // Implementation placeholder
    return state;
  }

  _metricsStale() {
    if (!this.storageMetrics) return true;
    const age = Date.now() - this.storageMetrics.timestamp;
    return age > 30000; // 30 seconds
  }

  async _getAllWorldMetadata() {
    const metadata = [];
    
    for (const adapter of this.adapters) {
      const worlds = await adapter.listWorlds();
      metadata.push(...worlds);
    }
    
    return metadata;
  }

  async _getWorldSize(worldId) {
    for (const adapter of this.adapters) {
      const size = await adapter.getSize(worldId);
      if (size !== null) return size;
    }
    return 0;
  }

  async _deleteWorld(worldId) {
    const promises = this.adapters.map(adapter => 
      adapter.delete(worldId).catch(err => console.warn(err))
    );
    await Promise.all(promises);
  }

  _requestCleanupConsent(staleWorlds) {
    // Show UI modal/dialog for user consent
    return new Promise((resolve) => {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('storageCleanupRequest', {
          detail: {
            staleWorlds,
            callback: resolve
          }
        });
        window.dispatchEvent(event);
      } else {
        resolve(false);
      }
    });
  }

  async _readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  async _migrateWorldData(worldState, fromVersion, toVersion) {
    // Version migration logic
    // Placeholder for actual implementation
    return worldState;
  }

  async _consolidateDeltas() {
    // Convert all delta saves to full snapshots
    // Implementation placeholder
  }

  async _trimOldWorldHistory() {
    // Remove old turn history from worlds
    // Implementation placeholder
  }

  _repairNullValues(worldId, data, validation) {
    // Repair strategy: replace null values with defaults
    // Implementation placeholder
    return data;
  }

  _repairMissingFields(worldId, data, validation) {
    // Repair strategy: add missing required fields
    // Implementation placeholder
    return data;
  }

  async _loadFromBackup(worldId, data, validation) {
    // Repair strategy: load from backup if available
    // Implementation placeholder
    throw new Error('No backup available');
  }

  async _reconstructFromHistory(worldId, data, validation) {
    // Repair strategy: reconstruct from historical deltas
    // Implementation placeholder
    throw new Error('History reconstruction not available');
  }

  async _updateWorldAccessTime(worldId) {
    for (const adapter of this.adapters) {
      try {
        await adapter.updateAccessTime(worldId);
      } catch (error) {
        // Non-critical, log and continue
        console.warn(`Failed to update access time for ${worldId}:`, error);
      }
    }
  }

  scheduleAutoCleanup() {
    // Run cleanup check every hour
    this.cleanupInterval = setInterval(async () => {
      const metrics = await this.getStorageMetrics();
      
      if (metrics.localStorage.percentUsed > this.config.warningThreshold) {
        await this.cleanupStaleWorlds({ force: false, archive: true });
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export default StorageManager;
```

### 2. Storage Adapters

#### LocalStorageAdapter
```javascript
// src/infrastructure/storage/LocalStorageAdapter.js

class LocalStorageAdapter {
  constructor(options = {}) {
    this.name = 'LocalStorage';
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    this.prefix = options.prefix || 'whse_';
  }

  async initialize() {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage not available');
    }

    // Test quota
    try {
      const testKey = `${this.prefix}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded at initialization');
      }
      throw error;
    }
  }

  async save(worldId, data, options = {}) {
    const key = this._getKey(worldId);
    const dataStr = JSON.stringify(data);

    try {
      localStorage.setItem(key, dataStr);
      
      // Save metadata
      await this._saveMetadata(worldId, {
        size: dataStr.length,
        lastModified: Date.now(),
        compressed: data.compressed || false
      });

      return { success: true, size: dataStr.length };

    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Provide detailed quota error
        const usage = this._calculateUsage();
        error.message = `localStorage quota exceeded. Current usage: ${usage.used}/${usage.total} bytes`;
      }
      throw error;
    }
  }

  async load(worldId) {
    const key = this._getKey(worldId);
    const dataStr = localStorage.getItem(key);

    if (!dataStr) {
      return null;
    }

    try {
      return JSON.parse(dataStr);
    } catch (error) {
      throw new Error(`Failed to parse world data for ${worldId}: ${error.message}`);
    }
  }

  async delete(worldId) {
    const key = this._getKey(worldId);
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_metadata`);
  }

  async listWorlds() {
    const worlds = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix) && !key.endsWith('_metadata')) {
        const worldId = key.substring(this.prefix.length);
        const metadata = await this.getMetadata(worldId);
        worlds.push({ id: worldId, ...metadata });
      }
    }

    return worlds;
  }

  async getMetadata(worldId) {
    const key = `${this._getKey(worldId)}_metadata`;
    const metaStr = localStorage.getItem(key);
    
    if (!metaStr) {
      return { lastAccessed: 0, size: 0 };
    }

    try {
      return JSON.parse(metaStr);
    } catch (error) {
      return { lastAccessed: 0, size: 0 };
    }
  }

  async getSize(worldId) {
    const metadata = await this.getMetadata(worldId);
    return metadata.size || 0;
  }

  async updateAccessTime(worldId) {
    const metadata = await this.getMetadata(worldId);
    metadata.lastAccessed = Date.now();
    await this._saveMetadata(worldId, metadata);
  }

  _getKey(worldId) {
    return `${this.prefix}${worldId}`;
  }

  async _saveMetadata(worldId, metadata) {
    const key = `${this._getKey(worldId)}_metadata`;
    localStorage.setItem(key, JSON.stringify(metadata));
  }

  _calculateUsage() {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      used += key.length + value.length;
    }

    return {
      used,
      total: this.maxSize,
      available: this.maxSize - used
    };
  }
}

export default LocalStorageAdapter;
```

### 3. CompressionService

```javascript
// src/domain/services/CompressionService.js

import LZString from 'lz-string';

class CompressionService {
  constructor(options = {}) {
    this.algorithm = options.algorithm || 'lz-string';
    this.compressionLevel = options.level || 'default';
  }

  async compress(data) {
    const startTime = performance.now();
    const input = typeof data === 'string' ? data : JSON.stringify(data);

    let compressed;
    
    switch (this.algorithm) {
      case 'lz-string':
        compressed = LZString.compressToUTF16(input);
        break;
      default:
        throw new Error(`Unknown compression algorithm: ${this.algorithm}`);
    }

    const compressionTime = performance.now() - startTime;
    const compressionRatio = compressed.length / input.length;

    return {
      compressed: true,
      algorithm: this.algorithm,
      data: compressed,
      originalSize: input.length,
      compressedSize: compressed.length,
      compressionRatio,
      compressionTime
    };
  }

  async decompress(compressedData) {
    const startTime = performance.now();
    
    // Handle both wrapped and unwrapped compressed data
    const data = compressedData.compressed ? compressedData.data : compressedData;
    const algorithm = compressedData.algorithm || this.algorithm;

    let decompressed;

    switch (algorithm) {
      case 'lz-string':
        decompressed = LZString.decompressFromUTF16(data);
        break;
      default:
        throw new Error(`Unknown compression algorithm: ${algorithm}`);
    }

    if (!decompressed) {
      throw new Error('Decompression failed - corrupted data');
    }

    const decompressionTime = performance.now() - startTime;

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(decompressed);
      return parsed;
    } catch (error) {
      // Return as string if not JSON
      return decompressed;
    }
  }
}

export default CompressionService;
```

## Integration with Existing System

### Update LocalStorageWorldRepository

```javascript
// src/infrastructure/Persistance/LocalStorageWorldRepository.js

import StorageManager from '../../application/services/StorageManager.js';

// Create singleton storage manager
const storageManager = new StorageManager({
  enableCompression: true,
  enableIncrementalSave: true,
  enableAutoCleanup: true
});

const LocalStorageWorldRepository = {
  saveWorld: async (worldState) => {
    // Use StorageManager instead of direct localStorage
    const worldId = worldState.worldProperties?.name || 'default-world';
    
    const result = await storageManager.saveWorld(worldId, worldState);
    
    if (!result.success) {
      throw new Error(`Failed to save world: ${result.error}`);
    }

    return result;
  },

  getWorld: async (worldId = 'default-world') => {
    const result = await storageManager.loadWorld(worldId);
    
    if (!result.success) {
      throw new Error(`Failed to load world: ${result.error}`);
    }

    return result.worldState;
  },

  // ... other methods updated similarly
};

export default LocalStorageWorldRepository;
```

## UI Components for Storage Monitoring

### StorageIndicator Component

```jsx
// src/presentation/components/StorageIndicator.jsx

import React, { useState, useEffect } from 'react';
import { storageManager } from '../../application/services/StorageManager.js';

const StorageIndicator = () => {
  const [metrics, setMetrics] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateMetrics = async () => {
      const data = await storageManager.getStorageMetrics();
      setMetrics(data);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30s

    // Listen for storage warnings
    const handleWarning = (e) => {
      alert(`Storage Warning: ${e.detail.message}`);
    };

    window.addEventListener('storageWarning', handleWarning);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storageWarning', handleWarning);
    };
  }, []);

  if (!metrics) return null;

  const { localStorage } = metrics;
  const statusColor = 
    localStorage.percentUsed >= 0.9 ? 'red' :
    localStorage.percentUsed >= 0.7 ? 'orange' : 'green';

  return (
    <div className="storage-indicator">
      <div className="storage-bar" onClick={() => setShowDetails(!showDetails)}>
        <div 
          className="storage-fill" 
          style={{ 
            width: `${localStorage.percentUsed * 100}%`,
            backgroundColor: statusColor
          }}
        />
      </div>
      
      {showDetails && (
        <div className="storage-details">
          <p>Used: {(localStorage.used / 1024 / 1024).toFixed(2)} MB</p>
          <p>Total: {(localStorage.total / 1024 / 1024).toFixed(2)} MB</p>
          <p>Available: {(localStorage.available / 1024 / 1024).toFixed(2)} MB</p>
          <button onClick={() => storageManager.cleanupStaleWorlds()}>
            Clean Up Old Worlds
          </button>
        </div>
      )}
    </div>
  );
};

export default StorageIndicator;
```

## Testing Strategy

### Unit Tests
- CompressionService: Compress/decompress accuracy and performance
- ValidationService: Schema validation for various corruption scenarios
- StorageAdapters: Save/load/delete operations

### Integration Tests
- StorageManager: Full save/load cycle with compression and fallback
- Quota recovery: Simulate quota exceeded and verify recovery
- Data migration: Test version migrations

### Performance Tests
- Compression benchmarks for various world sizes
- Storage operation timing (target: < 1s for 5MB worlds)
- Memory usage during large world operations

## Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Compress 1MB world | < 100ms | 90th percentile |
| Decompress 1MB world | < 150ms | 90th percentile |
| Save world (compressed) | < 1s | Average |
| Load world (decompressed) | < 2s | Average |
| Storage metrics collection | < 50ms | Average |
| Validation (5MB world) | < 500ms | 95th percentile |

## Security Considerations

- No sensitive data encryption (future enhancement)
- Validate all imported data to prevent XSS
- Sanitize file names for exports
- Rate limit storage operations to prevent abuse
- Clear error messages without exposing internals

## Migration Path

1. Deploy StorageManager alongside existing repository
2. Gradually migrate save operations to use StorageManager
3. Add compression opt-in for users
4. Enable by default after validation period
5. Deprecate direct localStorage access

## Success Criteria

- ✅ Zero data loss incidents reported
- ✅ 95%+ automatic quota recovery success rate
- ✅ 50%+ average compression ratio
- ✅ < 1% performance regression
- ✅ All storage operations under target times
- ✅ Positive user feedback (90%+ satisfaction)
