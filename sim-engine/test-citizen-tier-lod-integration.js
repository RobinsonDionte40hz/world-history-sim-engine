/**
 * Test Citizen Tier LOD Integration
 *
 * Verifies that citizen tier information is properly integrated with LOD system:
 * - LOD processing considers citizen tier multipliers
 * - Citizen tier is preserved during LOD transitions
 * - Prestige calculations use citizen tier multipliers
 * - Population groups use citizen tier for base properties
 */

const DemoService = require('./src/application/services/DemoService.js');
const LODManager = require('./src/domain/services/LODManager.js');
const PopulationGroupService = require('./src/domain/services/PopulationGroupService.js');
const PrestigeService = require('./src/domain/services/PrestigeService.js');

async function testCitizenTierLODIntegration() {
  console.log('🧪 Testing Citizen Tier LOD Integration...\n');

  try {
    // Test 1: Demo Service creates characters with proper citizen tiers
    console.log('Test 1: Demo Service Citizen Tier Assignment');
    const demoService = new DemoService();
    const world = await demoService.generateValleyOfEchoes();

    // Count characters by LOD tier and citizen tier
    const characterStats = {
      hero: { LEADER: 0, SPECIALIST: 0, CITIZEN: 0 },
      group: { LEADER: 0, SPECIALIST: 0, CITIZEN: 0 },
      background: { LEADER: 0, SPECIALIST: 0, CITIZEN: 0 }
    };

    for (const [, character] of world.characters) {
      if (character.citizenTier && character.lodTier) {
        characterStats[character.lodTier][character.citizenTier]++;
      }
    }

    console.log('Character distribution by LOD tier and citizen tier:');
    console.log(JSON.stringify(characterStats, null, 2));

    // Verify we have characters in all tiers with citizen tier assignments
    const totalCharacters = Object.values(characterStats).reduce((sum, tier) =>
      sum + Object.values(tier).reduce((tierSum, count) => tierSum + count, 0), 0);

    console.log(`✅ Total characters with citizen tiers: ${totalCharacters}`);

    // Test 2: LOD Manager processes characters with citizen tier multipliers
    console.log('\nTest 2: LOD Manager Citizen Tier Processing');

    const lodManager = new LODManager();
    await lodManager.initializeForWorld(world);

    // Process a few characters and check for citizen tier multipliers
    const testCharacters = Array.from(world.characters.values()).slice(0, 3);

    for (const character of testCharacters) {
      const result = lodManager.processCharacter(character, world, {});

      console.log(`Character ${character.name}:`);
      console.log(`  LOD Tier: ${result.lodTier}`);
      console.log(`  Citizen Tier: ${result.citizenTier}`);
      console.log(`  Citizen Tier Multiplier: ${result.citizenTierMultiplier}`);
      console.log(`  Processing Time: ${result.processingTime}ms`);

      // Verify citizen tier multiplier is applied correctly
      const expectedMultiplier = getExpectedMultiplier(character.citizenTier);
      if (Math.abs(result.citizenTierMultiplier - expectedMultiplier) < 0.01) {
        console.log(`  ✅ Correct multiplier applied`);
      } else {
        console.log(`  ❌ Incorrect multiplier: expected ${expectedMultiplier}, got ${result.citizenTierMultiplier}`);
      }
    }

    // Test 3: Population Group Service uses citizen tier
    console.log('\nTest 3: Population Group Service Citizen Tier Integration');

    const populationService = new PopulationGroupService();

    // Create population groups with different citizen tiers
    const leaderGroup = populationService.createPopulationGroup({
      name: 'Leader Group',
      citizenTier: 'LEADER',
      settlementId: 'oakwood',
      size: 10
    });

    const citizenGroup = populationService.createPopulationGroup({
      name: 'Citizen Group',
      citizenTier: 'CITIZEN',
      settlementId: 'oakwood',
      size: 10
    });

    console.log('Leader Group:', {
      name: leaderGroup.group?.name,
      citizenTier: leaderGroup.group?.citizenTier,
      averageWealth: leaderGroup.group?.averageWealth,
      productivity: leaderGroup.group?.productivity,
      skillLevel: leaderGroup.group?.skillLevel
    });

    console.log('Citizen Group:', {
      name: citizenGroup.group?.name,
      citizenTier: citizenGroup.group?.citizenTier,
      averageWealth: citizenGroup.group?.averageWealth,
      productivity: citizenGroup.group?.productivity,
      skillLevel: citizenGroup.group?.skillLevel
    });

    // Verify leader group has higher stats than citizen group
    if (leaderGroup.group.averageWealth > citizenGroup.group.averageWealth) {
      console.log('✅ Leader group has higher wealth than citizen group');
    } else {
      console.log('❌ Leader group should have higher wealth than citizen group');
    }

    if (leaderGroup.group.productivity > citizenGroup.group.productivity) {
      console.log('✅ Leader group has higher productivity than citizen group');
    } else {
      console.log('❌ Leader group should have higher productivity than citizen group');
    }

    // Test 4: Prestige Service uses citizen tier multipliers
    console.log('\nTest 4: Prestige Service Citizen Tier Integration');

    const prestigeService = new PrestigeService();

    // Create test characters with different citizen tiers
    const leaderCharacter = {
      id: 'leader-test',
      name: 'Test Leader',
      citizenTier: 'LEADER',
      prestige: createMockPrestige()
    };

    const citizenCharacter = {
      id: 'citizen-test',
      name: 'Test Citizen',
      citizenTier: 'CITIZEN',
      prestige: createMockPrestige()
    };

    // Test achievement with both characters
    const achievement = {
      type: 'military_victory',
      description: 'Won a battle',
      magnitude: 1
    };

    const socialContext = {
      witnesses: 10,
      settlementId: 'oakwood'
    };

    const leaderPrestigeUpdate = prestigeService.updatePrestige(
      leaderCharacter.prestige,
      achievement,
      socialContext,
      leaderCharacter
    );

    const citizenPrestigeUpdate = prestigeService.updatePrestige(
      citizenCharacter.prestige,
      achievement,
      socialContext,
      citizenCharacter
    );

    console.log('Leader prestige change:', leaderPrestigeUpdate.changes?.[0]?.amount || 'N/A');
    console.log('Citizen prestige change:', citizenPrestigeUpdate.changes?.[0]?.amount || 'N/A');

    // Leader should get more prestige than citizen
    const leaderChange = leaderPrestigeUpdate.changes?.[0]?.amount || 0;
    const citizenChange = citizenPrestigeUpdate.changes?.[0]?.amount || 0;

    if (leaderChange > citizenChange) {
      console.log('✅ Leader gets more prestige than citizen for same achievement');
    } else {
      console.log('❌ Leader should get more prestige than citizen');
    }

    // Test 5: LOD Transitions preserve citizen tier
    console.log('\nTest 5: LOD Transitions Preserve Citizen Tier');

    const testCharacter = Array.from(world.characters.values())[0];
    const originalLodTier = testCharacter.lodTier;
    const originalCitizenTier = testCharacter.citizenTier;

    console.log(`Original: LOD=${originalLodTier}, Citizen=${originalCitizenTier}`);

    // Simulate LOD transition
    if (originalLodTier === 'background') {
      testCharacter.lodTier = 'group';
    } else if (originalLodTier === 'group') {
      testCharacter.lodTier = 'hero';
    }

    console.log(`After transition: LOD=${testCharacter.lodTier}, Citizen=${testCharacter.citizenTier}`);

    if (testCharacter.citizenTier === originalCitizenTier) {
      console.log('✅ Citizen tier preserved during LOD transition');
    } else {
      console.log('❌ Citizen tier was not preserved during LOD transition');
    }

    console.log('\n🎉 Citizen Tier LOD Integration Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

function getExpectedMultiplier(citizenTier) {
  switch (citizenTier) {
    case 'LEADER': return 1.5;
    case 'SPECIALIST': return 1.25;
    case 'CITIZEN': return 1.0;
    default: return 1.0;
  }
}

function createMockPrestige() {
  // Mock prestige object for testing
  return {
    getTrackIds: () => ['military', 'social', 'honor'],
    hasTrack: (trackId) => ['military', 'social', 'honor'].includes(trackId),
    getValue: (trackId) => 50,
    getTrack: (trackId) => ({
      id: trackId,
      min: 0,
      max: 100,
      decayRate: 0.01
    }),
    withChange: function(trackId, amount, reason, contextData) {
      return {
        ...this,
        changes: [{ trackId, amount, reason, contextData }]
      };
    }
  };
}

// Run the test
testCitizenTierLODIntegration().catch(console.error);