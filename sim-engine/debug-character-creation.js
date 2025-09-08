// Debug script to test Character creation
const { default: Character } = require('./src/domain/entities/Character.js');

// Test creating character without economic profile
const charWithoutProfile = new Character({
  id: 'test-char',
  name: 'Test Character'
});

console.log('Character created without explicit economic profile:');
console.log('Has economic profile:', !!charWithoutProfile.economicProfile);
console.log('Economic profile wealth:', charWithoutProfile.economicProfile?.wealth);
console.log('Economic profile type:', charWithoutProfile.economicProfile?.constructor.name);

// Test the toJSON method
const jsonData = charWithoutProfile.toJSON();
console.log('toJSON includes economicProfile:', 'economicProfile' in jsonData);
console.log('toJSON includes initialWealth:', 'initialWealth' in jsonData);
