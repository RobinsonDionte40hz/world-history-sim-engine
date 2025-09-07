/**
 * Debug script to understand procreation decision calculation
 */

import FamilyDecisionService from '../domain/services/FamilyDecisionService.js';

const familyDecisionService = new FamilyDecisionService();

// Mock settlement with good conditions for children
const mockSettlement = {
  population: {
    total: 500,
    growth: 0.02
  },
  resources: {
    amounts: {
      food: 120,
      water: 150,
      materials: 80
    }
  },
  government: {
    type: 'council',
    laws: [
      { id: 'safety', description: 'Safety regulations' },
      { id: 'trade', description: 'Trade laws' }
    ]
  },
  economy: {
    averageWealth: 200,
    averageIncome: 60
  }
};

// Mock ideal married couple
const mockMarriedCouple = [
  {
    id: 'spouse1',
    age: 28,
    attributes: {
      wisdom: { score: 15 },
      constitution: { score: 14 }
    },
    consciousness: {
      coherence: 0.8
    },
    personality: {
      traits: {
        empathy: 0.8,
        patience: 0.7,
        aggression: 0.2,
        loyalty: 0.9,
        curiosity: 0.6
      }
    },
    resources: {
      wealth: 300,
      income: 80,
      property: 1
    }
  },
  {
    id: 'spouse2',
    age: 26,
    attributes: {
      wisdom: { score: 13 },
      constitution: { score: 16 }
    },
    consciousness: {
      coherence: 0.7
    },
    personality: {
      traits: {
        empathy: 0.9,
        patience: 0.8,
        aggression: 0.1,
        loyalty: 0.8,
        curiosity: 0.7
      }
    },
    resources: {
      wealth: 250,
      income: 70,
      property: 0
    }
  }
];

console.log('=== DEBUG: Procreation Decision Calculation ===');

// Test individual factor calculations
console.log('\n1. Economic Stability:');
const economicStability = familyDecisionService.calculateEconomicStability(mockMarriedCouple, mockSettlement);
console.log(`Result: ${economicStability.toFixed(3)}`);
console.log(`Combined wealth: ${mockMarriedCouple[0].resources.wealth + mockMarriedCouple[1].resources.wealth}`);
console.log(`Combined income: ${mockMarriedCouple[0].resources.income + mockMarriedCouple[1].resources.income}`);
console.log(`Settlement avg wealth: ${mockSettlement.economy.averageWealth}`);
console.log(`Settlement avg income: ${mockSettlement.economy.averageIncome}`);

console.log('\n2. Health Suitability:');
const healthFactors = familyDecisionService.calculateHealthSuitability(mockMarriedCouple);
console.log(`Result: ${healthFactors.toFixed(3)}`);
console.log(`Spouse 1 constitution: ${mockMarriedCouple[0].attributes.constitution.score}`);
console.log(`Spouse 2 constitution: ${mockMarriedCouple[1].attributes.constitution.score}`);
console.log(`Spouse 1 age: ${mockMarriedCouple[0].age}`);
console.log(`Spouse 2 age: ${mockMarriedCouple[1].age}`);

console.log('\n3. Settlement Conditions:');
const settlementConditions = familyDecisionService.evaluateSettlementForChildren(mockSettlement);
console.log(`Result: ${settlementConditions.toFixed(3)}`);

console.log('\n4. Personal Desire:');
const personalDesire = familyDecisionService.calculatePersonalDesire(mockMarriedCouple);
console.log(`Result: ${personalDesire.toFixed(3)}`);
console.log(`Spouse 1 empathy: ${mockMarriedCouple[0].personality.traits.empathy}`);
console.log(`Spouse 2 empathy: ${mockMarriedCouple[1].personality.traits.empathy}`);

console.log('\n5. Age Factors:');
const ageFactors = familyDecisionService.calculateAgeFactors(mockMarriedCouple);
console.log(`Result: ${ageFactors.toFixed(3)}`);

console.log('\n6. Overall Probability:');
const factors = {
  economicStability,
  healthFactors,
  settlementConditions,
  personalDesire,
  ageFactors
};
const probability = familyDecisionService.calculateProcreationProbability(factors);
console.log(`Result: ${probability.toFixed(3)}`);

console.log('\n7. Decision Weight:');
const familyPlanningWisdom = (mockMarriedCouple[0].attributes.wisdom.score + mockMarriedCouple[1].attributes.wisdom.score) / 2;
const avgConsciousness = (mockMarriedCouple[0].consciousness.coherence + mockMarriedCouple[1].consciousness.coherence) / 2;
const decisionWeight = (familyPlanningWisdom / 20) * avgConsciousness;
console.log(`Family planning wisdom: ${familyPlanningWisdom}`);
console.log(`Average consciousness: ${avgConsciousness}`);
console.log(`Decision weight: ${decisionWeight.toFixed(3)}`);

console.log('\n8. Final Decision:');
const finalScore = probability * decisionWeight;
console.log(`Final score: ${finalScore.toFixed(3)}`);
console.log(`Threshold: 0.5`);
console.log(`Should procreate: ${finalScore > 0.5}`);

console.log('\n9. Full Evaluation:');
const result = familyDecisionService.evaluateProcreationDecision(mockMarriedCouple, mockSettlement);
console.log(`Decision: ${result.decision}`);
console.log(`Probability: ${result.probability.toFixed(3)}`);
console.log(`Decision Weight: ${result.decisionWeight.toFixed(3)}`);
console.log('\nFactor breakdown:');
Object.entries(result.factors).forEach(([key, value]) => {
  console.log(`  ${key}: ${value.toFixed(3)}`);
});
