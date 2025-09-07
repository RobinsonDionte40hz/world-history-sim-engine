/**
 * Debug script to test compatibility scoring
 */

import FamilyDecisionService from './domain/services/FamilyDecisionService.js';

const familyDecisionService = new FamilyDecisionService();

// Test characters from the failing test
const aggressiveCharacter = {
  id: 'aggressive',
  age: 30,
  personality: {
    traits: {
      empathy: 0.2,
      aggression: 0.9,
      patience: 0.1,
      ambition: 0.9,
      loyalty: 0.3,
      curiosity: 0.4
    }
  },
  attributes: {
    charisma: { score: 8 },
    constitution: { score: 15 },
    wisdom: { score: 8 }
  },
  social: {
    status: 'commoner',
    reputation: 30,
    connections: ['tavern_friend']
  },
  resources: {
    wealth: 50,
    income: 20,
    property: 0
  },
  culture: {
    religion: 'war_god',
    values: { strength: 0.9, family: 0.3 },
    traditions: ['warrior_rites'],
    language: 'common'
  },
  consciousness: {
    coherence: 0.3,
    selfAwareness: 0.2,
    emotionalRegulation: 0.2,
    growthPotential: 0.3
  }
};

const gentleCharacter = {
  id: 'gentle',
  age: 25,
  personality: {
    traits: {
      empathy: 0.9,
      aggression: 0.1,
      patience: 0.9,
      ambition: 0.3,
      loyalty: 0.8,
      curiosity: 0.7
    }
  },
  attributes: {
    charisma: { score: 14 },
    constitution: { score: 10 },
    wisdom: { score: 16 }
  },
  social: {
    status: 'artisan',
    reputation: 70,
    connections: ['guild_member', 'neighbor']
  },
  resources: {
    wealth: 200,
    income: 40,
    property: 1
  },
  culture: {
    religion: 'nature_worship',
    values: { peace: 0.9, family: 0.8 },
    traditions: ['peace_ceremony'],
    language: 'common'
  },
  consciousness: {
    coherence: 0.8,
    selfAwareness: 0.9,
    emotionalRegulation: 0.8,
    growthPotential: 0.7
  }
};

const settlement = {
  economy: {
    averageWealth: 200,
    averageIncome: 60,
    growth: 0.05
  }
};

console.log('Testing compatibility...');
const result = familyDecisionService.evaluateMarriageCompatibility(
  aggressiveCharacter, 
  gentleCharacter, 
  settlement
);

console.log('Overall Score:', result.overallScore);
console.log('Compatibility breakdown:', result.compatibility);
console.log('Compatible:', result.compatible);
console.log('Decision Quality:', result.decisionQuality);

// Test individual components
console.log('\n--- Individual Component Testing ---');
console.log('Personality:', familyDecisionService.calculatePersonalityCompatibility(
  aggressiveCharacter.personality, 
  gentleCharacter.personality
));

console.log('Consciousness:', familyDecisionService.calculateConsciousnessCompatibility(
  aggressiveCharacter.consciousness,
  gentleCharacter.consciousness
));

console.log('Aggression Balance:', familyDecisionService.calculateAggressionBalance(0.9, 0.1));
