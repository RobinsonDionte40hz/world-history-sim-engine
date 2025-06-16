const NPCAutonomySystem = require('../NPCAutonomySystem');

// Create an instance of the NPC Autonomy System
const npcSystem = new NPCAutonomySystem();

// Example 1: Creating a merchant NPC with consciousness and D&D stats
function createMerchantNPC() {
    const merchantId = 'merchant_001';
    
    // Set up consciousness state
    npcSystem.consciousnessSystem.createConsciousnessState(merchantId, {
        baseFrequency: 8.5,  // Social/achievement oriented
        currentFrequency: 8.2,
        emotionalCoherence: 0.8,
        fieldRadius: 3.0
    });

    // Set up D&D ability scores
    npcSystem.setAbilityScores(merchantId, {
        STR: 10,
        DEX: 14,
        CON: 12,
        INT: 14,
        WIS: 13,
        CHA: 16
    });

    // Set up skill proficiencies
    npcSystem.setProficiency(merchantId, 'persuasion', true);
    npcSystem.setProficiency(merchantId, 'insight', true);
    npcSystem.setProficiency(merchantId, 'deception', true);

    return merchantId;
}

// Example 2: Creating a guard NPC with different consciousness profile
function createGuardNPC() {
    const guardId = 'guard_001';
    
    // Set up consciousness state
    npcSystem.consciousnessSystem.createConsciousnessState(guardId, {
        baseFrequency: 6.5,  // More survival/social oriented
        currentFrequency: 6.8,
        emotionalCoherence: 0.9,
        fieldRadius: 2.0
    });

    // Set up D&D ability scores
    npcSystem.setAbilityScores(guardId, {
        STR: 16,
        DEX: 14,
        CON: 15,
        INT: 10,
        WIS: 12,
        CHA: 8
    });

    // Set up skill proficiencies
    npcSystem.setProficiency(guardId, 'athletics', true);
    npcSystem.setProficiency(guardId, 'perception', true);
    npcSystem.setProficiency(guardId, 'intimidation', true);

    return guardId;
}

// Example 3: Demonstrate consciousness-based skill checks
function demonstrateSkillChecks(merchantId, guardId) {
    console.log('\n=== Skill Check Examples ===');
    
    // Merchant trying to persuade guard
    const persuasionCheck = npcSystem.rollSkillCheck(merchantId, 'persuasion', 15);
    console.log('Merchant Persuasion Check:', persuasionCheck);
    
    // Guard trying to intimidate merchant
    const intimidationCheck = npcSystem.rollSkillCheck(guardId, 'intimidation', 12);
    console.log('Guard Intimidation Check:', intimidationCheck);
}

// Example 4: Demonstrate goal generation
function demonstrateGoalGeneration(merchantId, guardId) {
    console.log('\n=== Goal Generation Examples ===');
    
    const merchantGoals = npcSystem.generateGoalsByFrequency(merchantId);
    console.log('Merchant Goals:', merchantGoals);
    
    const guardGoals = npcSystem.generateGoalsByFrequency(guardId);
    console.log('Guard Goals:', guardGoals);
}

// Example 5: Demonstrate autonomous decision making
function demonstrateDecisionMaking(merchantId, guardId) {
    console.log('\n=== Decision Making Examples ===');
    
    const context = {
        location: 'marketplace',
        time: 'day',
        nearbyNPCs: [guardId]
    };
    
    const merchantDecision = npcSystem.makeAutonomousDecision(merchantId, context);
    console.log('Merchant Decision:', merchantDecision);
    
    const guardDecision = npcSystem.makeAutonomousDecision(guardId, context);
    console.log('Guard Decision:', guardDecision);
}

// Run the examples
function runExamples() {
    console.log('=== NPC Autonomy System Examples ===\n');
    
    const merchantId = createMerchantNPC();
    const guardId = createGuardNPC();
    
    demonstrateSkillChecks(merchantId, guardId);
    demonstrateGoalGeneration(merchantId, guardId);
    demonstrateDecisionMaking(merchantId, guardId);
}

// Execute the examples
runExamples(); 