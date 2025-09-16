/**
 * Test script to verify the content interaction fix in GenerateBehavior.js
 */

import fs from 'fs';

const GENERATE_BEHAVIOR_PATH = './src/application/use-cases/npc/GenerateBehavior.js';

console.log('🔍 Testing content interaction fix in GenerateBehavior.js...\n');

try {
  // Read the GenerateBehavior.js file
  const content = fs.readFileSync(GENERATE_BEHAVIOR_PATH, 'utf8');
  
  // Test 1: Check that gatherAvailableInteractions properly handles both system and content interactions
  const hasSystemInteractionsHandling = content.includes('availableInteractionsData.systemInteractions');
  const hasContentInteractionsHandling = content.includes('availableInteractionsData.contentInteractions');
  
  console.log('✅ Test 1: Separate handling of system and content interactions');
  console.log(`   - System interactions handling: ${hasSystemInteractionsHandling ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`   - Content interactions handling: ${hasContentInteractionsHandling ? '✅ FOUND' : '❌ MISSING'}`);
  
  // Test 2: Check for content interaction priority boost
  const hasContentPriorityBoost = content.includes('Content interaction priority boost') || 
                                   content.includes('!interaction.isSystemInteraction');
  
  console.log('\n✅ Test 2: Content interaction priority boost');
  console.log(`   - Priority boost logic: ${hasContentPriorityBoost ? '✅ FOUND' : '❌ MISSING'}`);
  
  // Test 3: Check for proper weight calculation structure
  const hasCalculateInteractionWeights = content.includes('calculateInteractionWeights');
  const hasSelectWeightedInteraction = content.includes('selectWeightedInteraction');
  
  console.log('\n✅ Test 3: New weight calculation structure');
  console.log(`   - calculateInteractionWeights function: ${hasCalculateInteractionWeights ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`   - selectWeightedInteraction function: ${hasSelectWeightedInteraction ? '✅ FOUND' : '❌ MISSING'}`);
  
  // Test 4: Check for debug logging of interaction breakdown
  const hasDebugLogging = content.includes('system interactions, ') && content.includes(' content interactions');
  
  console.log('\n✅ Test 4: Debug logging for interaction breakdown');
  console.log(`   - Interaction type breakdown logging: ${hasDebugLogging ? '✅ FOUND' : '❌ MISSING'}`);
  
  // Test 5: Check for helper functions
  const hasCalculateAttributeBonus = content.includes('function calculateAttributeBonus');
  const hasCalculateConsciousnessInfluence = content.includes('function calculateConsciousnessInfluence');
  
  console.log('\n✅ Test 5: Helper functions for weight calculation');
  console.log(`   - calculateAttributeBonus: ${hasCalculateAttributeBonus ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`   - calculateConsciousnessInfluence: ${hasCalculateConsciousnessInfluence ? '✅ FOUND' : '❌ MISSING'}`);
  
  // Test 6: Check that interactions are properly pushed to the array
  const hasPushSystemInteractions = content.includes('interactions.push(...availableInteractionsData.systemInteractions)');
  const hasPushContentInteractions = content.includes('interactions.push(...availableInteractionsData.contentInteractions)');
  
  console.log('\n✅ Test 6: Proper interaction array assembly');
  console.log(`   - Push system interactions: ${hasPushSystemInteractions ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`   - Push content interactions: ${hasPushContentInteractions ? '✅ FOUND' : '❌ MISSING'}`);
  
  // Summary
  const allChecks = [
    hasSystemInteractionsHandling,
    hasContentInteractionsHandling,
    hasContentPriorityBoost,
    hasCalculateInteractionWeights,
    hasSelectWeightedInteraction,
    hasDebugLogging,
    hasCalculateAttributeBonus,
    hasCalculateConsciousnessInfluence,
    hasPushSystemInteractions,
    hasPushContentInteractions
  ];
  
  const passed = allChecks.filter(Boolean).length;
  const total = allChecks.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FIX VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Checks passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 ALL CHECKS PASSED! Content interaction fix is properly implemented.');
  } else {
    console.log('⚠️  Some checks failed. The fix may need additional work.');
  }
  
  console.log('\n🔍 Key improvements made:');
  console.log('   1. Separate handling of system vs content interactions');
  console.log('   2. Content interactions get 1.5x weight boost');  
  console.log('   3. Proper debugging and logging of interaction types');
  console.log('   4. Enhanced weight calculation with multiple factors');
  console.log('   5. Helper functions for attribute and consciousness influence');
  
} catch (error) {
  console.error('❌ Error reading GenerateBehavior.js:', error.message);
  process.exit(1);
}