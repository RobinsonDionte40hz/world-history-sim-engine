// Test value object deserialization fixes
import { Alignment } from './src/domain/value-objects/Alignment.js';
import { Influence } from './src/domain/value-objects/Influence.js';
import { Prestige } from './src/domain/value-objects/Prestige.js';

console.log('🔧 Testing Value Object Deserialization Fixes\n');

// Test Alignment
console.log('📋 Testing Alignment...');
try {
  const emptyAlignment = Alignment.fromJSON({});
  console.log('✅ Alignment handles empty data correctly');
  console.log(`   - Axes: ${emptyAlignment.axes.length} (${emptyAlignment.axes.map(a => a.id).join(', ')})`);
} catch (error) {
  console.log('❌ Alignment failed:', error.message);
}

// Test Influence
console.log('\n📋 Testing Influence...');
try {
  const emptyInfluence = Influence.fromJSON({});
  console.log('✅ Influence handles empty data correctly');
  console.log(`   - Domains: ${emptyInfluence.domains.length} (${emptyInfluence.domains.map(d => d.id).join(', ')})`);
} catch (error) {
  console.log('❌ Influence failed:', error.message);
}

// Test Prestige
console.log('\n📋 Testing Prestige...');
try {
  const emptyPrestige = Prestige.fromJSON({});
  console.log('✅ Prestige handles empty data correctly');
  console.log(`   - Tracks: ${emptyPrestige.tracks.length} (${emptyPrestige.tracks.map(t => t.id).join(', ')})`);
} catch (error) {
  console.log('❌ Prestige failed:', error.message);
}

// Test serialization round-trip
console.log('\n🔄 Testing Serialization Round-Trip...');
try {
  const originalAlignment = Alignment.fromJSON({});
  const serialized = originalAlignment.toJSON();
  const restored = Alignment.fromJSON(serialized);
  
  console.log('✅ Alignment round-trip successful');
  console.log(`   - Original axes: ${originalAlignment.axes.length}`);
  console.log(`   - Restored axes: ${restored.axes.length}`);
  console.log(`   - Serialized has axes: ${serialized.axes?.length || 0}`);
} catch (error) {
  console.log('❌ Round-trip failed:', error.message);
}

console.log('\n🎉 Value object fix verification completed!');