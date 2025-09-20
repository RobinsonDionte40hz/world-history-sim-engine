/**
 * Manual Debug Commands - Updated for WorldHistorySimInterface
 * 
 * Simple debug commands you can copy-paste into browser console
 * if the debug buttons aren't working. Updated for current architecture.
 */

// Copy and paste this entire block into your browser console:

window.manualDebugSimulation = function() {
  console.log('🔍 MANUAL DEBUG - SIMULATION INTERFACE & STATE:');
  console.log('='.repeat(50));
  
  // 1. Check localStorage for simulation data
  console.log('1. SIMULATION LOCALSTORAGE CHECK:');
  const worlds = localStorage.getItem('worldHistorySimulator_worlds');
  const worldsList = worlds ? JSON.parse(worlds) : [];
  console.log('   Worlds list:', worldsList);
  
  // 2. Check all simulation-related keys
  console.log('2. SIMULATION-RELATED KEYS:');
  const allKeys = Object.keys(localStorage);
  const simKeys = allKeys.filter(key => 
    key.includes('world') || 
    key.includes('simulation') || 
    key.includes('turn') ||
    key.includes('lod')
  );
  console.log('   Simulation-related keys:', simKeys);
  
  // 3. Check React context state (if available)
  console.log('3. REACT CONTEXT CHECK:');
  const simContextEl = document.querySelector('[data-testid="simulation-provider"]');
  if (simContextEl) {
    console.log('   Simulation provider found in DOM');
  } else {
    console.log('   ⚠️ Simulation provider not found in DOM');
  }
  
  // 4. Check for debug utilities
  console.log('4. DEBUG UTILITIES CHECK:');
  console.log('   debugSimInterface available:', !!window.debugSimInterface);
  console.log('   debugWorldFlow available:', !!window.debugWorldFlow);
  console.log('   React DevTools:', !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
  
  // 5. Memory usage
  console.log('5. MEMORY USAGE:');
  if (performance.memory) {
    console.log('   Used:', Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB');
    console.log('   Total:', Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB');
  } else {
    console.log('   Memory API not available');
  }
  
  console.log('='.repeat(50));
  console.log('Manual simulation debug completed. Check output above.');
};

// Quick simulation state check
window.quickSimDebug = function() {
  const worlds = JSON.parse(localStorage.getItem('worldHistorySimulator_worlds') || '[]');
  const simKeys = Object.keys(localStorage).filter(k => 
    k.includes('world') || k.includes('simulation')
  );
  
  console.log('Quick Simulation Debug:');
  console.log('- Worlds in list:', worlds.length);
  console.log('- Simulation-related keys:', simKeys.length);
  console.log('- Active worlds:', worlds.filter(w => w.isActive || w.lastAccessed));
  console.log('- Debug utils:', {
    simInterface: !!window.debugSimInterface,
    worldFlow: !!window.debugWorldFlow
  });
};

// Modern debug state check
window.checkSimulationHealth = function() {
  console.group('🏥 Simulation Health Check');
  
  // Check for common issues
  const issues = [];
  
  // Check localStorage
  const worlds = JSON.parse(localStorage.getItem('worldHistorySimulator_worlds') || '[]');
  if (worlds.length === 0) {
    issues.push('No worlds found in localStorage');
  }
  
  // Check for memory leaks
  if (performance.memory) {
    const memoryUsage = performance.memory.usedJSHeapSize / 1048576;
    if (memoryUsage > 100) { // More than 100MB
      issues.push(`High memory usage: ${Math.round(memoryUsage)}MB`);
    }
  }
  
  // Check for debug utilities
  if (!window.debugSimInterface) {
    issues.push('Debug utilities not loaded');
  }
  
  // Report results
  if (issues.length === 0) {
    console.log('✅ All checks passed!');
  } else {
    console.warn('⚠️ Issues found:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
  }
  
  console.groupEnd();
};

console.log('🛠️ Updated manual debug functions loaded:');
console.log('- Run: manualDebugSimulation() - Full simulation debug');
console.log('- Run: quickSimDebug() - Quick state check');
console.log('- Run: checkSimulationHealth() - Health diagnostics');

// Export the functions for potential module use
export const manualDebugSimulation = window.manualDebugSimulation;
export const quickSimDebug = window.quickSimDebug;
export const checkSimulationHealth = window.checkSimulationHealth;