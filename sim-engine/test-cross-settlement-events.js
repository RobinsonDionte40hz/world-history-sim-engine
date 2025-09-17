// Test cross-settlement event generation
const HistoryGenerator = require('./src/domain/services/HistoryGenerator.js').default;

const historyGen = new HistoryGenerator();

// Test settlements
const sourceSettlement = {
  id: 'settlement1',
  name: 'Riverbend',
  type: 'town',
  population: { total: 500 }
};

const targetSettlement = {
  id: 'settlement2',
  name: 'Mountainview',
  type: 'village',
  population: { total: 300 }
};

// Test trade event generation
console.log('Testing cross-settlement event generation...');

const tradeEvents = historyGen.generateCrossSettlementEvents(
  sourceSettlement,
  targetSettlement,
  'trade',
  { volume: 75, goods: ['wheat', 'tools'] }
);

console.log('Generated trade events:', tradeEvents.length);
console.log('First event type:', tradeEvents[0]?.type);
console.log('First event subtype:', tradeEvents[0]?.subtype);

// Test diplomacy event generation
const diplomacyEvents = historyGen.generateCrossSettlementEvents(
  sourceSettlement,
  targetSettlement,
  'diplomacy',
  { outcome: 'alliance' }
);

console.log('Generated diplomacy events:', diplomacyEvents.length);
console.log('First event type:', diplomacyEvents[0]?.type);
console.log('First event subtype:', diplomacyEvents[0]?.subtype);

// Test retrieval methods
const crossEvents = historyGen.getCrossSettlementEvents('settlement1', 'settlement2');
console.log('Retrieved cross-settlement events:', crossEvents.length);

const relationshipSummary = historyGen.getSettlementRelationshipSummary('settlement1');
console.log('Relationship summary length:', relationshipSummary.length);

console.log('Cross-settlement event generation test completed successfully!');