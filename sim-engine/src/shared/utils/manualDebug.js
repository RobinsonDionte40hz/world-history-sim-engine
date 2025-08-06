/**
 * Manual Debug Commands
 * 
 * Simple debug commands you can copy-paste into browser console
 * if the debug buttons aren't working.
 */

// Copy and paste this entire block into your browser console:

window.manualDebugNaming = function() {
  console.log('🔍 MANUAL DEBUG - WORLD NAMING & PERSISTENCE:');
  console.log('='.repeat(50));
  
  // 1. Check localStorage
  console.log('1. LOCALSTORAGE CHECK:');
  const worlds = localStorage.getItem('worldHistorySimulator_worlds');
  const worldsList = worlds ? JSON.parse(worlds) : [];
  console.log('   Worlds list:', worldsList);
  
  // 2. Check all keys
  console.log('2. ALL LOCALSTORAGE KEYS:');
  const allKeys = Object.keys(localStorage);
  console.log('   All keys:', allKeys);
  
  // 3. World-related keys
  console.log('3. WORLD-RELATED KEYS:');
  const worldKeys = allKeys.filter(key => 
    key.includes('world') || 
    key.includes('World') || 
    key.includes('foundation') || 
    key.includes('Foundation')
  );
  console.log('   World-related keys:', worldKeys);
  
  // 4. Official world keys
  console.log('4. OFFICIAL WORLD KEYS:');
  const officialKeys = allKeys.filter(key => key.startsWith('worldHistorySimulator_'));
  console.log('   Official keys:', officialKeys);
  
  // 5. Check each world's data
  console.log('5. INDIVIDUAL WORLD DATA:');
  worldsList.forEach((world, index) => {
    console.log(`   World ${index + 1}:`, world);
    const worldKey = `worldHistorySimulator_world_${world.id}`;
    const worldData = localStorage.getItem(worldKey);
    if (worldData) {
      console.log(`   Data for "${world.name}":`, JSON.parse(worldData));
    } else {
      console.log(`   ⚠️ NO DATA for "${world.name}" at key: ${worldKey}`);
    }
  });
  
  console.log('='.repeat(50));
  console.log('Manual debug completed. Check output above.');
};

// Also create a simple version
window.quickDebug = function() {
  const worlds = JSON.parse(localStorage.getItem('worldHistorySimulator_worlds') || '[]');
  const allKeys = Object.keys(localStorage).filter(k => k.includes('world'));
  console.log('Quick Debug:');
  console.log('- Worlds in list:', worlds.length);
  console.log('- World-related keys:', allKeys.length);
  console.log('- Worlds:', worlds);
  console.log('- Keys:', allKeys);
};

console.log('🛠️ Manual debug functions loaded:');
console.log('- Run: manualDebugNaming()');
console.log('- Run: quickDebug()');

export { manualDebugNaming, quickDebug };