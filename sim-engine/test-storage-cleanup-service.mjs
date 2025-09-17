// test-storage-cleanup-service.mjs
// Simple test script to validate StorageCleanupService functionality

/**
 * Mock localStorage for testing
 */
class MockLocalStorage {
  constructor() {
    this.storage = {};
  }

  getItem(key) {
    return this.storage[key] || null;
  }

  setItem(key, value) {
    this.storage[key] = value;
  }

  removeItem(key) {
    delete this.storage[key];
  }

  clear() {
    this.storage = {};
  }

  get length() {
    return Object.keys(this.storage).length;
  }

  key(index) {
    const keys = Object.keys(this.storage);
    return keys[index] || null;
  }

  getAllKeys() {
    return Object.keys(this.storage);
  }

  getStorageSnapshot() {
    return { ...this.storage };
  }
}

// Set up mock localStorage
global.localStorage = new MockLocalStorage();

/**
 * Simplified StorageCleanupService for testing
 */
class StorageCleanupService {
  static STORAGE_KEYS = {
    WORLD_STATE: 'worldState',
    WORLDS: 'worlds',
    CURRENT_WORLD_ID: 'currentWorldId',
    TEMPLATES: 'templates',
    LOD_CACHE: 'lodCache',
    HISTORY_CACHE: 'historyCache',
    SIMULATION_CACHE: 'simulationCache'
  };

  static clearAllSimulationState() {
    try {
      const keysCleared = [];
      
      if (localStorage.getItem(this.STORAGE_KEYS.WORLD_STATE)) {
        localStorage.removeItem(this.STORAGE_KEYS.WORLD_STATE);
        keysCleared.push(this.STORAGE_KEYS.WORLD_STATE);
      }

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

  static checkForContamination() {
    try {
      const warnings = [];
      
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

      if (worldState) {
        try {
          const stateData = JSON.parse(worldState);
          if (stateData.time !== undefined) {
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

  static getStorageReport() {
    try {
      const report = {
        totalKeys: localStorage.length,
        simulationKeys: {},
        otherKeys: [],
        totalSize: 0
      };

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
}

async function testStorageContaminationFix() {
  console.log('=== Testing Storage Contamination Fix ===\n');

  try {
    // Step 1: Simulate contaminated localStorage state
    console.log('1. Setting up contaminated localStorage state...');
    
    // Simulate first demo world state
    localStorage.setItem('worldState', JSON.stringify({
      time: 100,
      nodes: [{ id: 'village_center', name: 'Village Square' }],
      npcs: [{ id: 'elder_marcus', name: 'Elder Marcus' }],
      resources: { gold: 1000, food: 500 },
      contaminationData: {
        firstDemoSpecificData: 'This should not appear in second demo',
        timestamp: Date.now(),
        demoId: 'fantasy_village_demo'
      }
    }));

    localStorage.setItem('currentWorldId', 'demo_fantasy_village_123');
    localStorage.setItem('lodCache', JSON.stringify({ cached: 'lod_data' }));
    localStorage.setItem('historyCache', JSON.stringify({ history: 'turn_data' }));

    console.log('Contaminated state set. Current localStorage keys:', localStorage.getAllKeys());
    
    // Step 2: Check for contamination
    console.log('\n2. Checking for contamination...');
    const contaminationCheck1 = StorageCleanupService.checkForContamination();
    console.log('Contamination check result:', contaminationCheck1);

    // Step 3: Test clearWorldState
    console.log('\n3. Testing clearWorldState...');
    const clearWorldResult = StorageCleanupService.clearWorldState();
    console.log('clearWorldState result:', clearWorldResult);
    console.log('Keys after clearWorldState:', localStorage.getAllKeys());

    // Check if worldState was cleared but other keys remain
    const hasWorldState = localStorage.getItem('worldState') !== null;
    const hasOtherKeys = localStorage.getItem('currentWorldId') !== null;
    
    if (!hasWorldState && hasOtherKeys) {
      console.log('✅ clearWorldState working correctly - cleared worldState but preserved other keys');
    } else if (hasWorldState) {
      console.log('❌ clearWorldState failed - worldState still exists');
    } else {
      console.log('⚠️  clearWorldState cleared too much or unexpected state');
    }

    // Step 4: Re-add contamination and test comprehensive cleanup
    console.log('\n4. Re-adding contamination and testing comprehensive cleanup...');
    localStorage.setItem('worldState', JSON.stringify({ contaminated: 'data' }));
    localStorage.setItem('lodCache', JSON.stringify({ more: 'contamination' }));

    const comprehensiveResult = StorageCleanupService.clearAllSimulationState();
    console.log('clearAllSimulationState result:', comprehensiveResult);
    console.log('Keys after comprehensive cleanup:', localStorage.getAllKeys());

    // Step 5: Verify contamination is gone
    console.log('\n5. Final contamination check...');
    const finalContaminationCheck = StorageCleanupService.checkForContamination();
    console.log('Final contamination check:', finalContaminationCheck);

    // Step 6: Generate storage report
    console.log('\n6. Storage usage report...');
    const storageReport = StorageCleanupService.getStorageReport();
    console.log('Storage report:');
    console.log('- Total keys:', storageReport.totalKeys);
    console.log('- Simulation keys with data:', Object.entries(storageReport.simulationKeys)
      .filter(([key, data]) => data.hasData)
      .map(([key]) => key));
    console.log('- Other keys:', storageReport.otherKeys.map(item => item.key));

    console.log('\n=== Test Complete ===');
    
    const success = !finalContaminationCheck.hasContamination && 
                   clearWorldResult.success && 
                   comprehensiveResult.success;

    return {
      success,
      hasContamination: finalContaminationCheck.hasContamination,
      keysCleared: [...(clearWorldResult.keysCleared || []), ...(comprehensiveResult.keysCleared || [])],
      finalStorageKeys: localStorage.getAllKeys()
    };

  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testStorageContaminationFix()
  .then(result => {
    console.log('\n=== Test Result ===');
    console.log('Success:', result.success);
    console.log('Has contamination:', result.hasContamination);
    console.log('Keys cleared:', result.keysCleared);
    console.log('Final storage keys:', result.finalStorageKeys);
    
    if (result.success && !result.hasContamination) {
      console.log('\n✅ STORAGE CONTAMINATION FIX WORKING CORRECTLY');
      console.log('The localStorage cleanup service successfully prevents contamination between demo runs.');
    } else if (result.success && result.hasContamination) {
      console.log('\n⚠️  FIX PARTIALLY WORKING - Some contamination remains');
    } else {
      console.log('\n❌ FIX NOT WORKING - Test failed');
      if (result.error) {
        console.log('Error:', result.error);
      }
    }
  })
  .catch(console.error);