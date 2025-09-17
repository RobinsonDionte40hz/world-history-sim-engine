// test-storage-contamination-fix.js
// Test script to validate that localStorage contamination is properly resolved

import DemoService from './src/application/services/DemoService.js';
import StorageCleanupService from './src/application/services/StorageCleanupService.js';
import LocalStorageWorldRepository from './src/infrastructure/Persistance/LocalStorageWorldRepository.js';

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

async function testStorageContaminationFix() {
  console.log('=== Testing Storage Contamination Fix ===\n');

  try {
    // Step 1: Simulate first demo world run
    console.log('1. Running first demo world simulation...');
    const firstDemo = DemoService.generateDemoWorld('fantasy_village_demo');
    
    // Simulate LocalStorageWorldRepository saving state
    await LocalStorageWorldRepository.saveWorld({
      time: 100,
      nodes: firstDemo.nodes.values ? Array.from(firstDemo.nodes.values()) : firstDemo.nodes,
      npcs: firstDemo.characters.values ? Array.from(firstDemo.characters.values()) : firstDemo.characters,
      resources: { gold: 1000, food: 500 },
      // Add some contaminating data
      contaminationData: {
        firstDemoSpecificData: 'This should not appear in second demo',
        timestamp: Date.now(),
        demoId: 'fantasy_village_demo'
      }
    });

    console.log('First demo state saved. Current localStorage keys:', localStorage.getAllKeys());
    
    // Step 2: Check for contamination before cleanup
    console.log('\n2. Checking for contamination before cleanup...');
    const contaminationCheck1 = StorageCleanupService.checkForContamination();
    console.log('Contamination check:', contaminationCheck1);

    // Step 3: Clear world state (simulate switching to new demo)
    console.log('\n3. Clearing world state to prevent contamination...');
    const cleanupResult = StorageCleanupService.clearWorldState();
    console.log('Cleanup result:', cleanupResult);
    console.log('localStorage keys after cleanup:', localStorage.getAllKeys());

    // Step 4: Simulate second demo world run
    console.log('\n4. Running second demo world simulation...');
    const secondDemo = DemoService.generateDemoWorld('space_colony_demo');
    
    // Simulate LocalStorageWorldRepository loading (should be clean)
    const loadedState = await LocalStorageWorldRepository.getWorld();
    console.log('Loaded state after cleanup:', loadedState ? 'Has data (BAD - contamination!)' : 'Clean (GOOD)');

    // Save second demo state
    await LocalStorageWorldRepository.saveWorld({
      time: 1,
      nodes: secondDemo.nodes.values ? Array.from(secondDemo.nodes.values()) : secondDemo.nodes,
      npcs: secondDemo.characters.values ? Array.from(secondDemo.characters.values()) : secondDemo.characters,
      resources: { energy: 100, oxygen: 80 },
      secondDemoData: {
        spaceColonySpecificData: 'This is from the space colony demo',
        timestamp: Date.now(),
        demoId: 'space_colony_demo'
      }
    });

    // Step 5: Verify no contamination
    console.log('\n5. Verifying no contamination in second demo...');
    const finalState = await LocalStorageWorldRepository.getWorld();
    
    if (finalState && finalState.contaminationData) {
      console.error('❌ CONTAMINATION DETECTED: First demo data found in second demo!');
      console.log('Contaminating data:', finalState.contaminationData);
    } else if (finalState && finalState.secondDemoData) {
      console.log('✅ SUCCESS: Second demo runs clean without contamination');
      console.log('Second demo data:', finalState.secondDemoData);
    } else {
      console.warn('⚠️  UNEXPECTED: No state data found');
    }

    // Step 6: Test comprehensive cleanup
    console.log('\n6. Testing comprehensive cleanup...');
    const comprehensiveCleanup = StorageCleanupService.clearAllSimulationState();
    console.log('Comprehensive cleanup result:', comprehensiveCleanup);
    console.log('Final localStorage keys:', localStorage.getAllKeys());

    // Step 7: Final contamination check
    console.log('\n7. Final contamination check...');
    const finalContaminationCheck = StorageCleanupService.checkForContamination();
    console.log('Final contamination check:', finalContaminationCheck);

    // Step 8: Storage report
    console.log('\n8. Storage usage report...');
    const storageReport = StorageCleanupService.getStorageReport();
    console.log('Storage report:', JSON.stringify(storageReport, null, 2));

    console.log('\n=== Test Complete ===');
    return {
      success: true,
      hasContamination: finalContaminationCheck.hasContamination,
      keysCleared: cleanupResult.keysCleared,
      finalState
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
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && !result.hasContamination) {
      console.log('\n✅ STORAGE CONTAMINATION FIX WORKING CORRECTLY');
    } else if (result.success && result.hasContamination) {
      console.log('\n⚠️  FIX PARTIALLY WORKING - Some contamination remains');
    } else {
      console.log('\n❌ FIX NOT WORKING - Test failed');
    }
  })
  .catch(console.error);