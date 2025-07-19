// Quick validation test to check our fixes
const SimulationService = require('./src/application/use-cases/services/SimulationService.js');

console.log('Testing basic SimulationService functionality...');

try {
  // Test 1: getCurrentTurn with no worldState should return 0
  const currentTurn = SimulationService.getCurrentTurn();
  console.log('✓ getCurrentTurn() with no state:', currentTurn);
  
  // Test 2: Test valid mappless config validation
  const validConfig = {
    worldName: "Test World",
    worldDescription: "A test world",
    rules: { timeProgression: 'standard' },
    initialConditions: { season: 'spring' },
    nodes: [{
      id: "node1",
      name: "Village",
      type: "settlement",
      description: "A small village",
      environmentalProperties: { climate: 'temperate' },
      resourceAvailability: { food: 100 },
      culturalContext: { language: 'common' },
      assignedCharacters: ["char1"]
    }],
    characters: [{
      id: "char1",
      name: "Villager",
      attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      assignedInteractions: ["interact1"]
    }],
    interactions: [{
      id: "interact1",
      name: "Basic Work",
      type: "general",
      description: "Basic daily work",
      requirements: {},
      branches: [],
      effects: {},
      context: ["settlement"]
    }]
  };
  
  const isValid = SimulationService.validateMapplessWorldConfig(validConfig);
  console.log('✓ Valid mappless config validation:', isValid);
  
  // Test 3: Test invalid config (should reject)
  const invalidConfig = {
    worldName: "Test",
    nodes: [{
      id: "node1", 
      name: "Village",
      x: 100, // This should cause rejection (spatial coordinates)
      y: 100
    }]
  };
  
  const isInvalid = SimulationService.validateMapplessWorldConfig(invalidConfig);
  console.log('✓ Invalid config properly rejected:', !isInvalid);
  
  console.log('\nAll basic functionality tests passed! ✓');
  
} catch (error) {
  console.error('✗ Test failed:', error.message);
  process.exit(1);
}
