// Debug the validation issue
import CharacterEconomicService from './src/domain/services/CharacterEconomicService.js';
import Character from './src/domain/entities/Character.js';
import EconomicProfile from './src/domain/value-objects/EconomicProfile.js';

const mockEconomicProfile = new EconomicProfile({
  wealth: 1000,
  passiveIncome: 50,
  investments: [],
  goals: {},
  metadata: {
    riskTolerance: 'moderate',
    investmentStrategy: 'balanced',
    creditRating: 'good'
  }
});

const mockCharacter = new Character({
  id: 'test-char-1',
  name: 'Test Character',
  age: 30,
  level: 5,
  economicProfile: mockEconomicProfile,
  skills: {
    agriculture: 15,
    trading: 12,
    crafting: 8,
    leadership: 10,
    combat: 6
  }
});

// Test farmland validation specifically
const farmlandType = CharacterEconomicService.INVESTMENT_TYPES.farmland;
console.log('Farmland investment type:', farmlandType);
console.log('Prerequisites:', JSON.stringify(farmlandType.prerequisites, null, 2));

console.log('\nCharacter details:');
console.log('Level:', mockCharacter.level);
console.log('Skills:', mockCharacter.skills);
console.log('Wealth:', mockCharacter.economicProfile.wealth);

console.log('\nTesting prerequisite validation:');
const result = CharacterEconomicService.validateInvestmentPrerequisites(mockCharacter, farmlandType);
console.log('Validation result:', JSON.stringify(result, null, 2));
