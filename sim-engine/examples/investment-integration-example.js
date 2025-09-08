// examples/investment-integration-example.js

/**
 * Example demonstrating the integration of character investments with settlement need satisfaction
 * Shows how investments affect settlement development and create historical events
 */

import SettlementInvestmentIntegrationService from '../src/domain/services/SettlementInvestmentIntegrationService.js';
import InvestmentTurnProcessor from '../src/domain/services/InvestmentTurnProcessor.js';

// Example settlement with basic infrastructure
const exampleSettlement = {
  id: 'riverside_village',
  name: 'Riverside Village',
  population: { total: 250 },
  resources: {
    amounts: { food: 100, water: 80, goods: 60 },
    production: { food: 25, water: 20, goods: 15 },
    storage: { food: 200, water: 150, goods: 100 }
  },
  buildings: [
    { type: 'farm', level: 2 },
    { type: 'farm', level: 1 },
    { type: 'well', level: 2 },
    { type: 'workshop', level: 1 },
    { type: 'house', level: 3 },
    { type: 'house', level: 2 },
    { type: 'market', level: 1 }
  ],
  economy: {
    trade: [
      { value: 200, resources: { food: 10 }, frequency: 2 },
      { value: 150, resources: { goods: 8 }, frequency: 1 }
    ],
    markets: [
      { type: 'general', efficiency: 1.1 }
    ]
  },
  territory: {
    features: [
      { type: 'river' },
      { type: 'fertile_plains' }
    ]
  }
};

// Example characters with different investment strategies
const exampleCharacters = [
  {
    id: 'merchant_elena',
    name: 'Elena the Merchant',
    wealth: 500,
    investments: [
      {
        id: 'elena_trade_route_1',
        type: 'trade_route',
        settlementId: 'riverside_village',
        cost: 200,
        status: 'active',
        age: 5,
        returns: { goods: 8, wealth: 15 }
      },
      {
        id: 'elena_workshop_1',
        type: 'workshop',
        settlementId: 'riverside_village',
        cost: 150,
        status: 'active',
        age: 3,
        returns: { goods: 5 }
      }
    ]
  },
  {
    id: 'farmer_marcus',
    name: 'Marcus the Farmer',
    wealth: 300,
    investments: [
      {
        id: 'marcus_farmland_1',
        type: 'farmland',
        settlementId: 'riverside_village',
        cost: 180,
        status: 'active',
        age: 8,
        returns: { food: 12 }
      },
      {
        id: 'marcus_farmland_2',
        type: 'farmland',
        settlementId: 'riverside_village',
        cost: 120,
        status: 'active',
        age: 2,
        returns: { food: 8 }
      }
    ]
  },
  {
    id: 'builder_sara',
    name: 'Sara the Builder',
    wealth: 400,
    investments: [
      {
        id: 'sara_infrastructure_1',
        type: 'infrastructure',
        settlementId: 'riverside_village',
        cost: 250,
        status: 'active',
        age: 6,
        returns: { shelter: 6, water: 4 }
      }
    ]
  }
];

// Demonstration functions
function demonstrateBasicIntegration() {
  console.log('🏘️  BASIC INVESTMENT INTEGRATION DEMONSTRATION\n');
  
  const integrationService = new SettlementInvestmentIntegrationService();
  
  // Calculate need satisfaction without investments
  console.log('📊 Settlement Needs WITHOUT Investments:');
  const baseNeeds = integrationService.basicNeedsService.calculateSatisfactionLevel(exampleSettlement);
  console.log('   Food Satisfaction:', Math.round(baseNeeds.needs.food * 100) + '%');
  console.log('   Water Satisfaction:', Math.round(baseNeeds.needs.water * 100) + '%');
  console.log('   Shelter Satisfaction:', Math.round(baseNeeds.needs.shelter * 100) + '%');
  console.log('   Goods Satisfaction:', Math.round(baseNeeds.needs.goods * 100) + '%');
  console.log('   Services Satisfaction:', Math.round(baseNeeds.needs.services * 100) + '%');
  console.log('   Overall Satisfaction:', Math.round(baseNeeds.overall * 100) + '%\n');
  
  // Calculate need satisfaction with investments
  console.log('📈 Settlement Needs WITH Investments:');
  const investmentNeeds = integrationService.calculateInvestmentAffectedNeeds(exampleSettlement, exampleCharacters);
  console.log('   Food Satisfaction:', Math.round(investmentNeeds.needs.food * 100) + '%');
  console.log('   Water Satisfaction:', Math.round(investmentNeeds.needs.water * 100) + '%');
  console.log('   Shelter Satisfaction:', Math.round(investmentNeeds.needs.shelter * 100) + '%');
  console.log('   Goods Satisfaction:', Math.round(investmentNeeds.needs.goods * 100) + '%');
  console.log('   Services Satisfaction:', Math.round(investmentNeeds.needs.services * 100) + '%');
  console.log('   Overall Satisfaction:', Math.round(investmentNeeds.overall * 100) + '%\n');
  
  // Show investment effects
  console.log('🔧 Investment Effects:');
  console.log('   Food Multiplier:', investmentNeeds.investmentEffects.food.toFixed(2) + 'x');
  console.log('   Water Multiplier:', investmentNeeds.investmentEffects.water.toFixed(2) + 'x');
  console.log('   Shelter Multiplier:', investmentNeeds.investmentEffects.shelter.toFixed(2) + 'x');
  console.log('   Goods Multiplier:', investmentNeeds.investmentEffects.goods.toFixed(2) + 'x');
  console.log('   Services Multiplier:', investmentNeeds.investmentEffects.services.toFixed(2) + 'x\n');
  
  return investmentNeeds;
}

function demonstrateInvestmentAnalysis(investmentNeeds) {
  console.log('📊 INVESTMENT ANALYSIS\n');
  
  const analysis = investmentNeeds.investmentAnalysis;
  
  console.log('💰 Investment Overview:');
  console.log('   Total Investments:', analysis.totalInvestments);
  console.log('   Total Investment Value:', analysis.totalInvestmentValue + ' wealth');
  console.log('   Active Investors:', analysis.activeInvestors);
  console.log('   Overall Effectiveness:', Math.round(analysis.overallEffectiveness * 100) + '%\n');
  
  console.log('🎯 Most Improved Need:');
  console.log('   Type:', analysis.mostImprovedNeed.type);
  console.log('   Improvement:', Math.round(analysis.mostImprovedNeed.improvement * 100) + '%\n');
  
  console.log('🏗️  Investment Types:');
  Object.entries(analysis.investmentTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} investment${count !== 1 ? 's' : ''}`);
  });
  console.log();
  
  console.log('💡 Recommendations:');
  analysis.recommendations.forEach(rec => {
    console.log(`   ${rec.type}: ${rec.description} (Priority: ${rec.priority})`);
  });
  console.log();
}

function demonstrateHistoricalEvents(investmentNeeds) {
  console.log('📜 HISTORICAL EVENTS\n');
  
  if (investmentNeeds.historicalEvents.length === 0) {
    console.log('   No significant historical events generated this turn.\n');
    return;
  }
  
  investmentNeeds.historicalEvents.forEach(event => {
    console.log(`🎭 ${event.type.toUpperCase()}:`);
    console.log(`   Description: ${event.description}`);
    console.log(`   Impact: ${event.impact}`);
    console.log(`   Significance: ${event.significance}`);
    if (event.involvedCharacters && event.involvedCharacters.length > 0) {
      console.log(`   Involved Characters: ${event.involvedCharacters.join(', ')}`);
    }
    console.log();
  });
}

function demonstrateConsequences(investmentNeeds) {
  console.log('⚠️  CONSEQUENCES\n');
  
  if (investmentNeeds.consequences.length === 0) {
    console.log('   No negative consequences detected - settlement is thriving!\n');
    return;
  }
  
  investmentNeeds.consequences.forEach(consequence => {
    console.log(`🚨 ${consequence.type.toUpperCase()}:`);
    console.log(`   Description: ${consequence.description}`);
    console.log(`   Severity: ${Math.round(consequence.severity * 100)}%`);
    console.log(`   Duration: ${consequence.duration} turns`);
    if (consequence.effects) {
      console.log(`   Character Mood Impact: ${consequence.effects.character?.moodModifier || 0}`);
      console.log(`   Settlement Stability: ${consequence.effects.settlement?.stabilityChange || 0}`);
    }
    console.log();
  });
}

function demonstrateTurnProcessing() {
  console.log('🔄 TURN-BASED PROCESSING DEMONSTRATION\n');
  
  const turnProcessor = new InvestmentTurnProcessor();
  
  // Create simple world state
  const worldState = {
    settlements: [exampleSettlement],
    characters: exampleCharacters,
    turn: 15
  };
  
  console.log('🌍 Processing investment turn...');
  const turnResult = turnProcessor.processInvestmentTurn(worldState);
  
  console.log('✅ Turn processing complete!\n');
  
  console.log('📈 Turn Results Summary:');
  console.log('   Investment Events:', turnResult.turnResults.investmentEvents.length);
  console.log('   Settlement Updates:', turnResult.turnResults.settlementUpdates.length);
  console.log('   Character Effects:', turnResult.turnResults.characterEffects.length);
  console.log('   Economic Changes:', turnResult.turnResults.economicChanges.length);
  console.log();
  
  // Show character effects
  if (turnResult.turnResults.characterEffects.length > 0) {
    console.log('👥 Character Effects:');
    turnResult.turnResults.characterEffects.forEach(effect => {
      const character = exampleCharacters.find(c => c.id === effect.characterId);
      console.log(`   ${character?.name || effect.characterId}:`);
      Object.entries(effect.effects).forEach(([effectType, value]) => {
        console.log(`     ${effectType}: ${value > 0 ? '+' : ''}${value}`);
      });
    });
    console.log();
  }
  
  // Show economic changes
  if (turnResult.turnResults.economicChanges.length > 0) {
    console.log('💼 Economic Changes:');
    turnResult.turnResults.economicChanges.forEach(change => {
      console.log(`   ${change.type}: ${change.change > 0 ? '+' : ''}${Math.round(change.change * 100)}% (${change.reason})`);
    });
    console.log();
  }
  
  return turnResult;
}

function demonstrateSettlementUpdates(turnResult) {
  console.log('🏘️  SETTLEMENT UPDATES\n');
  
  const updates = turnResult.turnResults.settlementUpdates;
  
  updates.forEach(update => {
    console.log(`🏘️  ${update.updatedSettlement.name}:`);
    
    console.log('   Resource Production Changes:');
    const original = update.originalSettlement.resources.production;
    const updated = update.updatedSettlement.resources.production;
    
    ['food', 'water', 'goods'].forEach(resource => {
      const originalValue = original[resource] || 0;
      const updatedValue = updated[resource] || 0;
      const change = updatedValue - originalValue;
      if (change !== 0) {
        console.log(`     ${resource}: ${originalValue} → ${updatedValue} (${change > 0 ? '+' : ''}${change})`);
      }
    });
    
    console.log('   Improvement Metrics:');
    Object.entries(update.improvementMetrics).forEach(([metric, value]) => {
      console.log(`     ${metric}: ${value > 0 ? '+' : ''}${Math.round(value * 100)}%`);
    });
    console.log();
  });
}

// Run the demonstration
console.log('🎬 INVESTMENT INTEGRATION SYSTEM DEMONSTRATION\n');
console.log('===============================================\n');

try {
  // Step 1: Basic integration
  const investmentNeeds = demonstrateBasicIntegration();
  
  // Step 2: Investment analysis
  demonstrateInvestmentAnalysis(investmentNeeds);
  
  // Step 3: Historical events
  demonstrateHistoricalEvents(investmentNeeds);
  
  // Step 4: Consequences
  demonstrateConsequences(investmentNeeds);
  
  // Step 5: Turn processing
  const turnResult = demonstrateTurnProcessing();
  
  // Step 6: Settlement updates
  demonstrateSettlementUpdates(turnResult);
  
  console.log('🎉 DEMONSTRATION COMPLETE!\n');
  console.log('The investment integration system successfully:');
  console.log('✅ Connected character investments to settlement need satisfaction');
  console.log('✅ Applied investment effects to building efficiency calculations');
  console.log('✅ Generated investment-driven consequences and historical events');
  console.log('✅ Integrated with turn-based processing');
  console.log('✅ Updated settlement resources and economic state');
  
} catch (error) {
  console.error('❌ Demonstration failed:', error.message);
  console.error('Stack trace:', error.stack);
}

export {
  exampleSettlement,
  exampleCharacters,
  demonstrateBasicIntegration,
  demonstrateInvestmentAnalysis,
  demonstrateHistoricalEvents,
  demonstrateConsequences,
  demonstrateTurnProcessing,
  demonstrateSettlementUpdates
};
