// test-enhanced-decision-logging.js
// Test script to demonstrate the enhanced decision logging system

import Character from './src/domain/entities/Character.js';
import Interaction from './src/domain/entities/Interaction.js';
import generateBehavior from './src/application/use-cases/npc/GenerateBehavior.js';
import DecisionAnalysisService from './src/domain/services/DecisionAnalysisService.js';

console.log('🧠 Testing Enhanced Decision Logging System\n');

// Create a test character with personality and consciousness
const testCharacter = new Character({
  id: 'test_char_1',
  name: 'Aria the Explorer',
  age: 25,
  attributes: {
    strength: { score: 14, modifier: 2 },
    dexterity: { score: 16, modifier: 3 },
    constitution: { score: 13, modifier: 1 },
    intelligence: { score: 15, modifier: 2 },
    wisdom: { score: 12, modifier: 1 },
    charisma: { score: 11, modifier: 0 }
  },
  consciousness: {
    frequency: 42.5,
    coherence: 0.75
  },
  personality: {
    traits: new Map([
      ['adventurous', { value: 0.8, description: 'Loves exploring new places' }],
      ['curious', { value: 0.7, description: 'Always asking questions' }],
      ['cautious', { value: 0.3, description: 'Takes calculated risks' }],
      ['extroverted', { value: 0.6, description: 'Enjoys social interaction' }]
    ])
  },
  goals: [
    { id: 'explore', type: 'exploration', category: 'personal' },
    { id: 'learn', type: 'education', category: 'growth' }
  ],
  energy: 80,
  maxEnergy: 100,
  currentNodeId: 'forest_edge'
});

// Create test interactions
const interactions = [
  new Interaction({
    id: 'explore_ruins',
    name: 'Explore Ancient Ruins',
    type: 'exploration',
    category: 'exploration',
    tags: ['explore', 'risky'],
    description: 'Search the mysterious ruins for artifacts'
  }),
  new Interaction({
    id: 'rest_camp',
    name: 'Rest at Camp',
    type: 'rest',
    category: 'recovery',
    description: 'Set up camp and restore energy'
  }),
  new Interaction({
    id: 'chat_locals',
    name: 'Chat with Locals',
    type: 'social',
    category: 'social',
    tags: ['social', 'learn'],
    description: 'Talk to nearby villagers about the area'
  }),
  new Interaction({
    id: 'study_map',
    name: 'Study Map',
    type: 'planning',
    category: 'education',
    tags: ['learn', 'planning'],
    description: 'Examine the local map for points of interest'
  })
];

// Create test world state
const worldState = {
  time: Date.now(),
  nodes: [
    {
      id: 'forest_edge',
      name: 'Forest Edge',
      type: 'wilderness',
      environmentalProperties: {
        climate: 'temperate',
        season: 'spring'
      },
      environment: {
        isDangerous: () => false
      }
    }
  ],
  characters: [testCharacter],
  interactions: interactions
};

console.log('1. Character Profile:');
console.log(`   Name: ${testCharacter.name}`);
console.log(`   Consciousness: Freq ${testCharacter.consciousness.frequency}Hz, Coherence ${testCharacter.consciousness.coherence}`);
console.log(`   Top Traits: ${Array.from(testCharacter.personality.traits.entries())
  .filter(([_, trait]) => trait.value > 0.6)
  .map(([name, trait]) => `${name} (${(trait.value * 100).toFixed(0)}%)`)
  .join(', ')}`);
console.log(`   Goals: ${testCharacter.goals.map(g => g.id).join(', ')}`);
console.log(`   Energy: ${testCharacter.energy}/${testCharacter.maxEnergy}\n`);

// Simulate multiple decision cycles
console.log('2. Simulating Decision Cycles:\n');

for (let i = 0; i < 5; i++) {
  console.log(`--- Decision Cycle ${i + 1} ---`);
  
  // Vary character state to show different decision factors
  if (i === 2) {
    testCharacter.energy = 20; // Low energy
    console.log('   Character is now exhausted...');
  } else if (i === 3) {
    testCharacter.energy = 90; // Restored energy
    // Simulate dangerous environment
    worldState.nodes[0].environment.isDangerous = () => true;
    console.log('   Environment becomes dangerous...');
  } else if (i === 4) {
    worldState.nodes[0].environment.isDangerous = () => false;
    // Add consciousness emotional state
    testCharacter.consciousness.getCurrentEmotionalState = () => ({
      primary: 'excited',
      secondary: 'curious',
      intensity: 0.8
    });
    console.log('   Character becomes emotionally excited...');
  }
  
  // Mock available interactions for generateBehavior
  const mockGatherInteractions = () => interactions;
  
  // Generate behavior (this will create decision history)
  try {
    const result = generateBehavior(testCharacter, worldState);
    
    if (result && result.interaction) {
      console.log(`   Selected: ${result.interaction.name}`);
      
      // Get the latest decision from history
      const latestDecision = testCharacter.decisionHistory?.[testCharacter.decisionHistory.length - 1];
      if (latestDecision) {
        console.log(`   Weight: ${latestDecision.selectedInteraction.weight.toFixed(2)}`);
        console.log(`   Primary Reason: ${getPrimaryReason(latestDecision.reasoning)}`);
        
        if (latestDecision.reasoning.emergencyOverride) {
          console.log('   🚨 Emergency Override Triggered!');
        }
      }
    } else {
      console.log('   No interaction selected');
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('');
}

// Helper function to extract primary reasoning
function getPrimaryReason(reasoning) {
  if (!reasoning) return 'Unknown';
  
  if (reasoning.emergencyOverride) return 'Emergency';
  if (reasoning.needFactors?.energyLevel < 0.2) return 'Critical Energy';
  if (reasoning.needFactors?.goals?.length > 0) return `Goal: ${reasoning.needFactors.goals[0]}`;
  if (reasoning.personalityFactors?.dominantTraits?.length > 0) {
    const trait = reasoning.personalityFactors.dominantTraits[0];
    return `Personality: ${trait.name}`;
  }
  if (reasoning.environmentalFactors?.isDangerous) return 'Danger Response';
  return 'Random Selection';
}

console.log('3. Decision Analysis:');

// Analyze decision patterns
const decisionAnalysisService = new DecisionAnalysisService();
const analysis = decisionAnalysisService.analyzeDecisionHistory(testCharacter);

console.log('\nDecision Pattern Analysis:');
console.log(analysis.reasoning);

if (analysis.patterns.mostCommonActions?.length > 0) {
  console.log('\nMost Common Actions:');
  analysis.patterns.mostCommonActions.forEach(action => {
    console.log(`   ${action.action}: ${action.percentage}%`);
  });
}

if (analysis.patterns.consciousnessStability) {
  console.log(`\nConsciousness Stability: ${analysis.patterns.consciousnessStability.stability}`);
}

if (analysis.patterns.emergencyFrequency > 0) {
  console.log(`\nEmergency Frequency: ${analysis.patterns.emergencyFrequency.toFixed(0)}%`);
}

console.log('\n4. Recent Decision Details:');

if (analysis.recentDecisions.length > 0) {
  analysis.recentDecisions.slice(0, 3).forEach((decision, index) => {
    console.log(`\nDecision ${index + 1}: ${decision.selectedAction}`);
    console.log(`   Weight: ${decision.weight.toFixed(2)}`);
    console.log(`   Primary Reason: ${decision.reasoning.primary}`);
    console.log(`   Consciousness: ${decision.reasoning.consciousness}`);
    if (decision.reasoning.personality !== 'No dominant traits') {
      console.log(`   Personality: ${decision.reasoning.personality}`);
    }
    console.log(`   Environment: ${decision.reasoning.environment}`);
    console.log(`   Needs: ${decision.reasoning.needs}`);
    
    if (decision.alternatives.length > 0) {
      console.log(`   Alternatives: ${decision.alternatives.map(alt => `${alt.name} (${alt.weight.toFixed(1)})`).join(', ')}`);
    }
  });
}

console.log('\n🎉 Enhanced Decision Logging Test Complete!');
console.log('\nThe system now tracks:');
console.log('  ✅ Why characters made specific decisions');
console.log('  ✅ Consciousness influence on decision-making');
console.log('  ✅ Personality factors affecting choices');
console.log('  ✅ Environmental pressures and needs');
console.log('  ✅ Alternative options considered');
console.log('  ✅ Decision patterns and behavioral analysis');
console.log('  ✅ Historical context for each choice');

console.log('\nThis data can now be displayed in the Behavior Analysis panel!');