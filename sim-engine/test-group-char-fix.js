// Simple test to verify group character attribute fix
const { Character } = require('./src/domain/entities/Character.js');

console.log('🔧 Testing Group Character Attribute Fix');
console.log('========================================');

try {
  // Test creating a group character like the ones causing warnings
  const groupCharConfig = {
    id: 'test-merchants',
    name: 'Test Merchants',
    lodTier: 'group',
    populationGroupId: 'test-merchants',
    characterType: { typeId: 'group', category: 'npc' },
    baseAttributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    groupStatistics: {
      averageWealth: 200,
      morale: 0.8,
      productivity: 0.85,
      loyalty: 0.75
    }
  };

  const groupChar = new Character(groupCharConfig);
  
  console.log(`✅ Group character created: ${groupChar.name}`);
  console.log(`   - LOD Tier: ${groupChar.lodTier}`);
  console.log(`   - Has attributes: ${!!groupChar.attributes}`);
  console.log(`   - Attributes constructor: ${groupChar.attributes?.constructor?.name}`);
  console.log(`   - Has getTotalModifier: ${typeof groupChar.attributes?.getTotalModifier === 'function'}`);
  
  if (groupChar.attributes && typeof groupChar.attributes.getTotalModifier === 'function') {
    const intMod = groupChar.attributes.getTotalModifier('intelligence');
    console.log(`   - Intelligence modifier: ${intMod}`);
    console.log('🎉 Group character now has proper attributes!');
    console.log('   This should eliminate the "Character has no valid attributes" warnings.');
  } else {
    console.log('❌ Group character still missing proper attributes');
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}

console.log('\n📋 Expected Results:');
console.log('- InteractionResolver warnings should disappear');
console.log('- PerceptionInteraction warnings should disappear');
console.log('- Group characters will now have consistent attribute access');
console.log('- System will use actual attribute modifiers instead of fallback values');