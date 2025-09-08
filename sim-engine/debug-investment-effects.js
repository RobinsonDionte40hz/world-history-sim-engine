// Debug script to test CharacterEconomicService investment effects calculation

import CharacterEconomicService from './src/domain/services/CharacterEconomicService.js';

const testInvestment = {
  id: 'inv_1',
  type: 'farmland',
  value: 100,
  status: 'active'
};

const testSettlement = {
  id: 'settlement_1',
  population: { total: 100 }
};

console.log('=== Debug Investment Effects Calculation ===');
console.log('Investment:', testInvestment);
console.log('Settlement:', testSettlement);

try {
  const effects = CharacterEconomicService.calculateSettlementInvestmentEffects(
    [testInvestment],
    testSettlement
  );
  
  console.log('Raw effects result:', JSON.stringify(effects, null, 2));
  console.log('Food production effect:', effects.food.production);
  console.log('Food efficiency effect:', effects.food.efficiency);
  console.log('Food availability effect:', effects.food.availability);
  
  // Check investment type lookup
  console.log('\n=== Investment Type Lookup ===');
  const investmentType = CharacterEconomicService.INVESTMENT_TYPES[testInvestment.type];
  console.log('Investment type found:', !!investmentType);
  console.log('Settlement effects:', investmentType?.settlementEffects);
  
} catch (error) {
  console.error('Error calculating effects:', error);
}
