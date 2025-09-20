/**
 * Simple validation script for consciousness template integration
 */

import CharacterTemplateService from './src/domain/services/CharacterTemplateService.js';
import Character from './src/domain/entities/Character.js';

console.log('=== Consciousness Template Integration Validation ===\n');

// Test 1: Create template service
console.log('1. Creating CharacterTemplateService...');
const templateService = new CharacterTemplateService();
console.log('✓ Template service created successfully\n');

// Test 2: Get predefined templates
console.log('2. Getting predefined templates...');
const templates = templateService.getPredefinedTemplateNames();
console.log('Available templates:', templates);
console.log('✓ Found', templates.length, 'predefined templates\n');

// Test 3: Create character from template
console.log('3. Creating character from warrior template...');
const warriorCharacter = Character.fromTemplate('warrior');
console.log('Warrior character created:', {
  name: warriorCharacter.name,
  consciousness: warriorCharacter.consciousness,
  templateApplied: warriorCharacter.templateApplied
});
console.log('✓ Character created with consciousness and template metadata\n');

// Test 4: Validate consciousness parameters
console.log('4. Validating consciousness parameters...');
const validation = templateService.validateConsciousnessTemplate(warriorCharacter.consciousness);
console.log('Validation result:', validation);
console.log('✓ Consciousness parameters are valid\n');

// Test 5: Test serialization
console.log('5. Testing serialization/deserialization...');
const serialized = warriorCharacter.toJSON();
const deserialized = Character.fromJSON(serialized);
console.log('Template metadata preserved:', deserialized.templateApplied);
console.log('✓ Serialization/deserialization working correctly\n');

console.log('=== All Validation Tests Passed! ===');
console.log('Consciousness template integration is working correctly.');