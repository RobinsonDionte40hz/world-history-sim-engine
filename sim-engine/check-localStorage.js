// Script to check localStorage for cached world data
console.log('🔍 Checking localStorage for world data...\n');

try {
  // Check for world state
  const worldState = localStorage.getItem('worldState');
  if (worldState) {
    console.log('📦 Found worldState in localStorage');
    const parsed = JSON.parse(worldState);
    console.log('   Keys:', Object.keys(parsed));
    
    if (parsed.characters && Array.isArray(parsed.characters)) {
      console.log(`   📊 Characters in storage: ${parsed.characters.length}`);
      
      // Check a few characters for attribute issues
      const problemChars = parsed.characters.filter(char => 
        !char.baseAttributes && !char.attributes
      ).slice(0, 5);
      
      if (problemChars.length > 0) {
        console.log('\n❌ Found characters without attributes:');
        problemChars.forEach(char => {
          console.log(`   - ${char.name} (ID: ${char.id})`);
        });
      } else {
        console.log('✅ All stored characters have attributes');
      }
    }
  } else {
    console.log('📭 No worldState found in localStorage');
  }
  
  // Check other keys
  const allKeys = Object.keys(localStorage);
  console.log('\n📂 All localStorage keys:', allKeys);
  
} catch (error) {
  console.error('❌ Error checking localStorage:', error.message);
}

console.log('\n🧹 To clear localStorage: localStorage.clear()');