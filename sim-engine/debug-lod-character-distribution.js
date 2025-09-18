#!/usr/bin/env node

/**
 * Debug LOD Character Tier Distribution
 * This script helps debug why all characters might be showing in the 'group' tab
 */

console.log('🔍 Debugging LOD Character Tier Distribution...\n');

// Mock world state with characters
const createMockWorldState = () => ({
  characters: new Map([
    ['char1', { id: 'char1', name: 'Hero Character 1', lodTier: 'hero', energy: 85, health: 90 }],
    ['char2', { id: 'char2', name: 'Hero Character 2', lodTier: 'hero', energy: 75, health: 85 }],
    ['char3', { id: 'char3', name: 'Group Character 1', lodTier: 'group', energy: 65, health: 70 }],
    ['char4', { id: 'char4', name: 'Group Character 2', lodTier: 'group', energy: 60, health: 75 }],
    ['char5', { id: 'char5', name: 'Group Character 3', lodTier: 'group', energy: 70, health: 80 }],
    ['char6', { id: 'char6', name: 'Background Character 1', lodTier: 'background', energy: 50, health: 60 }],
    ['char7', { id: 'char7', name: 'Background Character 2', lodTier: 'background', energy: 45, health: 55 }],
    ['char8', { id: 'char8', name: 'Background Character 3', lodTier: 'background', energy: 55, health: 65 }],
    ['char9', { id: 'char9', name: 'Background Character 4', lodTier: 'background', energy: 40, health: 50 }],
    ['char10', { id: 'char10', name: 'Background Character 5', lodTier: 'background', energy: 60, health: 70 }]
  ]),
  turn: 1,
  events: []
});

// Simulate the dashboard filtering logic
const simulateDashboardFiltering = (worldState) => {
  console.log('📊 Simulating Dashboard Filtering Logic...\n');

  // Convert Map to Array (as the dashboard does)
  const characters = Array.from(worldState.characters.values());

  console.log('📋 All Characters:');
  characters.forEach(char => {
    console.log(`  ${char.name}: ${char.lodTier} (Energy: ${char.energy}, Health: ${char.health})`);
  });

  // Group by tier
  const byTier = characters.reduce((acc, char) => {
    const tier = char.lodTier || 'background';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(char);
    return acc;
  }, { hero: [], group: [], background: [] });

  console.log('\n🎯 Characters by Tier:');
  console.log(`  Hero: ${byTier.hero.length} characters`);
  byTier.hero.forEach(char => console.log(`    - ${char.name}`));

  console.log(`  Group: ${byTier.group.length} characters`);
  byTier.group.forEach(char => console.log(`    - ${char.name}`));

  console.log(`  Background: ${byTier.background.length} characters`);
  byTier.background.forEach(char => console.log(`    - ${char.name}`));

  // Simulate tab filtering
  console.log('\n📱 Tab Filtering Results:');
  console.log(`  All tab: ${characters.length} characters`);
  console.log(`  Hero tab: ${byTier.hero.length} characters`);
  console.log(`  Group tab: ${byTier.group.length} characters`);
  console.log(`  Background tab: ${byTier.background.length} characters`);

  return {
    total: characters.length,
    byTier: {
      hero: byTier.hero.length,
      group: byTier.group.length,
      background: byTier.background.length
    },
    characters: byTier
  };
};

// Simulate LOD stats calculation
const simulateLODStatsCalculation = (worldState) => {
  console.log('\n📈 Simulating LOD Stats Calculation...\n');

  const characters = Array.from(worldState.characters.values());

  const stats = {
    hero: characters.filter(c => c.lodTier === 'hero').length,
    group: characters.filter(c => c.lodTier === 'group').length,
    background: characters.filter(c => c.lodTier === 'background').length,
    total: characters.length
  };

  console.log('LOD Stats:', stats);

  return stats;
};

// Test different scenarios
const testScenarios = () => {
  console.log('🧪 Testing Different Character Distribution Scenarios...\n');

  // Scenario 1: Normal distribution
  console.log('=== SCENARIO 1: Normal Distribution ===');
  const worldState1 = createMockWorldState();
  const result1 = simulateDashboardFiltering(worldState1);
  const stats1 = simulateLODStatsCalculation(worldState1);

  // Scenario 2: All characters in group tier (the reported issue)
  console.log('\n=== SCENARIO 2: All Characters in Group Tier (Reported Issue) ===');
  const worldState2 = createMockWorldState();
  // Force all characters to group tier
  worldState2.characters.forEach(char => {
    char.lodTier = 'group';
  });
  const result2 = simulateDashboardFiltering(worldState2);
  const stats2 = simulateLODStatsCalculation(worldState2);

  // Scenario 3: All characters in background tier
  console.log('\n=== SCENARIO 3: All Characters in Background Tier ===');
  const worldState3 = createMockWorldState();
  // Force all characters to background tier
  worldState3.characters.forEach(char => {
    char.lodTier = 'background';
  });
  const result3 = simulateDashboardFiltering(worldState3);
  const stats3 = simulateLODStatsCalculation(worldState3);

  // Scenario 4: Mixed with some undefined tiers
  console.log('\n=== SCENARIO 4: Mixed with Undefined Tiers ===');
  const worldState4 = createMockWorldState();
  // Set some characters to undefined tier
  const chars = Array.from(worldState4.characters.values());
  chars[0].lodTier = undefined;
  chars[1].lodTier = null;
  chars[2].lodTier = '';
  const result4 = simulateDashboardFiltering(worldState4);
  const stats4 = simulateLODStatsCalculation(worldState4);

  return {
    scenario1: { result: result1, stats: stats1 },
    scenario2: { result: result2, stats: stats2 },
    scenario3: { result: result3, stats: stats3 },
    scenario4: { result: result4, stats: stats4 }
  };
};

// Analyze potential issues
const analyzeIssues = (results) => {
  console.log('\n🔍 Analyzing Potential Issues...\n');

  const issues = [];

  // Check if stats match filtering results
  Object.entries(results).forEach(([scenario, data]) => {
    const { result, stats } = data;

    if (stats.hero !== result.byTier.hero) {
      issues.push(`${scenario}: Hero stats (${stats.hero}) don't match filtering (${result.byTier.hero})`);
    }
    if (stats.group !== result.byTier.group) {
      issues.push(`${scenario}: Group stats (${stats.group}) don't match filtering (${result.byTier.group})`);
    }
    if (stats.background !== result.byTier.background) {
      issues.push(`${scenario}: Background stats (${stats.background}) don't match filtering (${result.byTier.background})`);
    }
    if (stats.total !== result.total) {
      issues.push(`${scenario}: Total stats (${stats.total}) don't match filtering (${result.total})`);
    }
  });

  if (issues.length === 0) {
    console.log('✅ No issues found - stats and filtering are consistent');
  } else {
    console.log('❌ Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Check for the reported issue
  const scenario2 = results.scenario2;
  if (scenario2.result.byTier.group === scenario2.result.total && scenario2.result.byTier.hero === 0 && scenario2.result.byTier.background === 0) {
    console.log('\n🎯 REPORTED ISSUE CONFIRMED:');
    console.log('  When all characters are in "group" tier:');
    console.log(`  - All tab shows: ${scenario2.result.total} characters`);
    console.log(`  - Hero tab shows: ${scenario2.result.byTier.hero} characters`);
    console.log(`  - Group tab shows: ${scenario2.result.byTier.group} characters (ALL characters!)`);
    console.log(`  - Background tab shows: ${scenario2.result.byTier.background} characters`);
    console.log('\n  This explains why users see all characters in the Group tab!');
  }

  return issues;
};

// Main execution
const main = () => {
  const worldState = createMockWorldState();

  console.log('🎭 Initial Character Distribution:');
  simulateDashboardFiltering(worldState);
  simulateLODStatsCalculation(worldState);

  const results = testScenarios();
  const issues = analyzeIssues(results);

  console.log('\n' + '='.repeat(80));
  console.log('📋 SUMMARY');
  console.log('='.repeat(80));

  if (issues.length === 0) {
    console.log('✅ All scenarios passed - no issues detected');
  } else {
    console.log('❌ Issues detected - see analysis above');
  }

  console.log('\n💡 POSSIBLE CAUSES OF "ALL CHARACTERS IN GROUP TAB" ISSUE:');
  console.log('  1. LOD system is over-promoting characters to "group" tier');
  console.log('  2. Character initialization is setting all characters to "group" tier');
  console.log('  3. LOD processing is incorrectly categorizing characters');
  console.log('  4. Data structure mismatch between Map and Array processing');
  console.log('  5. LOD stats calculation is not reflecting actual character tiers');

  console.log('\n🔧 DEBUGGING STEPS:');
  console.log('  1. Check character initialization in LODManager.initializeForWorld()');
  console.log('  2. Verify LOD promotion/demotion logic is working correctly');
  console.log('  3. Ensure worldState.characters is processed as Map, not Array');
  console.log('  4. Check if turn processing is modifying character tiers unexpectedly');
  console.log('  5. Verify dashboard filtering logic matches LOD stats calculation');

  return { results, issues };
};

// Run the debug script
main();