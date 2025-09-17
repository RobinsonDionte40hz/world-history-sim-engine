// src/application/services/StorageCleanupService.js

/**
 * StorageCleanupService - Centralized service for cleaning localStorage to prevent contamination
 * 
 * Provides methods to clear specific or all simulation-related localStorage keys
 * to prevent state contamination between different worlds or demo runs.
 */
class StorageCleanupService {
  /**
   * List of localStorage keys used by the simulation engine
   */
  static STORAGE_KEYS = {
    WORLD_STATE: 'worldState',              // Active simulation state
    WORLDS: 'worlds',                       // World collection
    CURRENT_WORLD_ID: 'currentWorldId',     // Active world ID
    TEMPLATES: 'templates',                 // Template storage
    LOD_CACHE: 'lodCache',                  // LOD system cache
    HISTORY_CACHE: 'historyCache',          // History/turn cache
    SIMULATION_CACHE: 'simulationCache'     // General simulation cache
  };

  /**
   * Clear all simulation state to prevent contamination
   * Use when switching between worlds or resetting the application
   */
  static clearAllSimulationState() {
    try {
      const keysCleared = [];
      
      // Clear worldState (most critical for contamination prevention)
      if (localStorage.getItem(this.STORAGE_KEYS.WORLD_STATE)) {
        localStorage.removeItem(this.STORAGE_KEYS.WORLD_STATE);
        keysCleared.push(this.STORAGE_KEYS.WORLD_STATE);
      }

      // Clear caches that might contain stale simulation data
      [
        this.STORAGE_KEYS.LOD_CACHE,
        this.STORAGE_KEYS.HISTORY_CACHE,
        this.STORAGE_KEYS.SIMULATION_CACHE
      ].forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          keysCleared.push(key);
        }
      });

      console.log('StorageCleanupService: Cleared simulation state keys:', keysCleared);
      return { success: true, keysCleared };
      
    } catch (error) {
      console.error('StorageCleanupService: Failed to clear simulation state:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear only world state (active simulation)
   * Use when switching between simulations but keeping world collection
   */
  static clearWorldState() {
    try {
      const keysCleared = [];
      
      if (localStorage.getItem(this.STORAGE_KEYS.WORLD_STATE)) {
        localStorage.removeItem(this.STORAGE_KEYS.WORLD_STATE);
        keysCleared.push(this.STORAGE_KEYS.WORLD_STATE);
      }

      console.log('StorageCleanupService: Cleared world state:', keysCleared);
      return { success: true, keysCleared };
      
    } catch (error) {
      console.error('StorageCleanupService: Failed to clear world state:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all world-related data including collections
   * Use when completely resetting the application or clearing all worlds
   */
  static clearAllWorldData() {
    try {
      const keysCleared = [];
      
      [
        this.STORAGE_KEYS.WORLD_STATE,
        this.STORAGE_KEYS.WORLDS,
        this.STORAGE_KEYS.CURRENT_WORLD_ID
      ].forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          keysCleared.push(key);
        }
      });

      console.log('StorageCleanupService: Cleared all world data:', keysCleared);
      return { success: true, keysCleared };
      
    } catch (error) {
      console.error('StorageCleanupService: Failed to clear world data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear cache-related storage
   * Use when you want to refresh cached data without affecting active simulation
   */
  static clearCaches() {
    try {
      const keysCleared = [];
      
      [
        this.STORAGE_KEYS.LOD_CACHE,
        this.STORAGE_KEYS.HISTORY_CACHE,
        this.STORAGE_KEYS.SIMULATION_CACHE
      ].forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          keysCleared.push(key);
        }
      });

      console.log('StorageCleanupService: Cleared caches:', keysCleared);
      return { success: true, keysCleared };
      
    } catch (error) {
      console.error('StorageCleanupService: Failed to clear caches:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current localStorage usage summary
   * Useful for debugging storage contamination issues
   */
  static getStorageReport() {
    try {
      const report = {
        totalKeys: localStorage.length,
        simulationKeys: {},
        otherKeys: [],
        totalSize: 0
      };

      // Check known simulation keys
      Object.values(this.STORAGE_KEYS).forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          report.simulationKeys[key] = {
            hasData: true,
            size: value.length,
            preview: value.substring(0, 100) + (value.length > 100 ? '...' : '')
          };
          report.totalSize += value.length;
        } else {
          report.simulationKeys[key] = { hasData: false, size: 0 };
        }
      });

      // Check for unknown keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!Object.values(this.STORAGE_KEYS).includes(key)) {
          const value = localStorage.getItem(key);
          report.otherKeys.push({
            key,
            size: value ? value.length : 0,
            preview: value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : null
          });
        }
      }

      return report;
      
    } catch (error) {
      console.error('StorageCleanupService: Failed to generate storage report:', error);
      return { error: error.message };
    }
  }

  /**
   * Check if there is potentially contaminating data in storage
   * Returns warnings about stale simulation state
   */
  static checkForContamination() {
    try {
      const warnings = [];
      
      // Check if worldState exists without a corresponding world collection
      const worldState = localStorage.getItem(this.STORAGE_KEYS.WORLD_STATE);
      const worlds = localStorage.getItem(this.STORAGE_KEYS.WORLDS);
      const currentWorldId = localStorage.getItem(this.STORAGE_KEYS.CURRENT_WORLD_ID);

      if (worldState && !currentWorldId) {
        warnings.push('Active simulation state exists but no current world ID is set - potential contamination');
      }

      if (worldState && worlds) {
        try {
          const worldsData = JSON.parse(worlds);
          if (currentWorldId && !worldsData[currentWorldId]) {
            warnings.push('Current world ID points to non-existent world - potential contamination');
          }
        } catch (e) {
          warnings.push('World collection data is corrupted - potential contamination');
        }
      }

      // Check for very old simulation state
      if (worldState) {
        try {
          const stateData = JSON.parse(worldState);
          if (stateData.time !== undefined) {
            // This is likely old format data - potential contamination
            warnings.push('Simulation state appears to be in old format - potential contamination');
          }
        } catch (e) {
          warnings.push('Simulation state data is corrupted - potential contamination');
        }
      }

      return {
        hasContamination: warnings.length > 0,
        warnings,
        recommendation: warnings.length > 0 
          ? 'Consider calling StorageCleanupService.clearAllSimulationState() to resolve contamination'
          : 'No contamination detected'
      };
      
    } catch (error) {
      console.error('StorageCleanupService: Failed to check for contamination:', error);
      return { error: error.message };
    }
  }
}

export default StorageCleanupService;