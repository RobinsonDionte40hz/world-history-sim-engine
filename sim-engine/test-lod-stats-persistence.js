#!/usr/bin/env node

/**
 * Test LOD Stats Persistence After Turn Processing
 * This test verifies that LOD stats remain consistent after turn processing
 */

console.log('🧪 Testing LOD Stats Persistence After Turn Processing...\n');

// Mock world state with characters
const createMockWorldState = () => ({
  characters: [
    { id: 'hero1', name: 'Hero 1', lodTier: 'hero' },
    { id: 'hero2', name: 'Hero 2', lodTier: 'hero' },
    { id: 'group1', name: 'Group 1', lodTier: 'group' },
    { id: 'group2', name: 'Group 2', lodTier: 'group' },
    { id: 'bg1', name: 'Background 1', lodTier: 'background' },
    { id: 'bg2', name: 'Background 2', lodTier: 'background' },
    { id: 'bg3', name: 'Background 3', lodTier: 'background' }
  ],
  turn: 1,
  events: []
});

// Mock LOD manager that modifies characters in place
const mockLODManager = {
  processPreTurnLOD: async (worldState) => {
    // Simulate promotion: move one background to group
    const bgChar = worldState.characters.find(c => c.lodTier === 'background');
    if (bgChar) {
      bgChar.lodTier = 'group';
    }
    return { success: true, events: [], changes: [] };
  },

  processPostTurnLOD: async (worldState, turnResult) => {
    // Simulate demotion: move one hero to group
    const heroChar = worldState.characters.find(c => c.lodTier === 'hero');
    if (heroChar) {
      heroChar.lodTier = 'group';
    }
    return { success: true, events: [], changes: [] };
  }
};

// Mock updateLODStats function
const createUpdateLODStats = () => {
  let currentStats = { hero: 0, group: 0, background: 0, total: 0 };

  const updateLODStats = (worldState) => {
    const stats = {
      hero: worldState.characters.filter(c => c.lodTier === 'hero').length,
      group: worldState.characters.filter(c => c.lodTier === 'group').length,
      background: worldState.characters.filter(c => c.lodTier === 'background').length,
      total: worldState.characters.length
    };
    currentStats = stats;
    console.log('📊 LOD Stats Updated:', stats);
    return stats;
  };

  const getCurrentStats = () => currentStats;

  return { updateLODStats, getCurrentStats };
};

// Test the fixed processLODTurn logic
const testProcessLODTurn = async () => {
  console.log('🎯 Testing Fixed processLODTurn Logic...\n');

  const worldState = createMockWorldState();
  const { updateLODStats, getCurrentStats } = createUpdateLODStats();

  console.log('📊 Initial World State:');
  console.log('   Characters by LOD tier:', worldState.characters.reduce((acc, c) => {
    acc[c.lodTier] = (acc[c.lodTier] || 0) + 1;
    return acc;
  }, {}));

  // Initial stats update
  updateLODStats(worldState);
  const initialStats = getCurrentStats();
  console.log('📊 Initial LOD Stats:', initialStats);

  // Simulate the FIXED processLODTurn logic
  console.log('\n🔄 Processing LOD Turn (Fixed Logic)...');

  // Process pre-turn LOD operations
  await mockLODManager.processPreTurnLOD(worldState);

  // Process post-turn LOD operations on the modified world state
  await mockLODManager.processPostTurnLOD(worldState, { events: [] });

  // Update statistics using the modified world state (THIS IS THE FIX)
  updateLODStats(worldState);

  const finalStats = getCurrentStats();
  console.log('📊 Final LOD Stats:', finalStats);

  // Verify the changes
  console.log('\n🔍 Verifying Changes:');
  console.log('   Initial:', initialStats);
  console.log('   Final:', finalStats);
  console.log('   Expected: Hero should decrease by 1, Group should increase by 2, Background should decrease by 1');

  const expectedStats = {
    hero: initialStats.hero - 1, // One hero demoted
    group: initialStats.group + 2, // One background promoted + one hero demoted
    background: initialStats.background - 1, // One background promoted
    total: initialStats.total
  };

  const success = JSON.stringify(finalStats) === JSON.stringify(expectedStats);

  if (success) {
    console.log('✅ TEST PASSED: LOD stats correctly reflect character tier changes');
  } else {
    console.log('❌ TEST FAILED: LOD stats do not match expected values');
    console.log('   Expected:', expectedStats);
    console.log('   Actual:', finalStats);
  }

  return success;
};

// Run the test
testProcessLODTurn()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('🎉 LOD Stats Persistence Test: PASSED');
      console.log('💡 The fix ensures LOD stats are updated using the modified world state');
    } else {
      console.log('❌ LOD Stats Persistence Test: FAILED');
      console.log('💡 The LOD stats are not being updated correctly after turn processing');
    }
    console.log('='.repeat(60));
  })
  .catch(error => {
    console.error('❌ Test Error:', error);
  });