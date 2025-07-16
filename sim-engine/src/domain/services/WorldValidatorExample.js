/**
 * WorldValidator Usage Examples
 * Demonstrates how to use the WorldValidator for comprehensive world validation
 */

const WorldValidator = require('./WorldValidator');

// Example 1: Valid world configuration
const validWorldConfig = {
  dimensions: { width: 100, height: 100 },
  rules: { 
    physics: { gravity: 9.8 }, 
    interactions: { maxDistance: 50 },
    timeScale: 1.0
  },
  initialConditions: { 
    characterCount: 5,
    resourceTypes: ['food', 'water', 'shelter'],
    startingResources: { food: 100, water: 100 }
  },
  nodes: [
    {
      id: 'village_center',
      name: 'Village Center',
      type: 'settlement',
      position: { x: 50, y: 50 },
      description: 'The heart of the village',
      properties: { population: 100 },
      resources: ['food', 'water']
    },
    {
      id: 'forest',
      name: 'Ancient Forest',
      type: 'wilderness',
      position: { x: 20, y: 80 },
      description: 'Dense forest with abundant wildlife',
      properties: { danger: 'low' },
      resources: ['wood', 'herbs']
    }
  ],
  characters: [
    {
      id: 'char_001',
      name: 'Elara the Wise',
      race: 'elf',
      attributes: { 
        strength: 8, 
        intelligence: 15, 
        charisma: 12,
        wisdom: 14,
        dexterity: 10
      },
      currentNodeId: 'village_center',
      background: {
        profession: 'scholar',
        age: 150,
        origin: 'village_center'
      },
      personality: {
        traits: ['wise', 'patient', 'curious'],
        alignment: 'neutral_good'
      },
      skills: ['research', 'teaching', 'herbalism']
    },
    {
      id: 'char_002',
      name: 'Thorin Ironforge',
      race: 'dwarf',
      attributes: { 
        strength: 16, 
        intelligence: 10, 
        charisma: 8,
        constitution: 14,
        dexterity: 6
      },
      currentNodeId: 'village_center',
      background: {
        profession: 'blacksmith',
        age: 85,
        origin: 'mountain_halls'
      },
      personality: {
        traits: ['stubborn', 'loyal', 'hardworking'],
        alignment: 'lawful_good'
      },
      skills: ['smithing', 'mining', 'combat']
    }
  ],
  interactions: [
    {
      id: 'social_greeting',
      name: 'Friendly Greeting',
      type: 'social',
      description: 'Characters greet each other when they meet',
      trigger: { type: 'proximity', distance: 5 },
      conditions: ['same_node', 'not_hostile'],
      effects: [
        { type: 'relationship', change: '+1' },
        { type: 'mood', change: '+0.1' }
      ],
      probability: 0.8
    },
    {
      id: 'resource_trade',
      name: 'Resource Trading',
      type: 'economic',
      description: 'Characters can trade resources',
      trigger: { type: 'interaction', action: 'trade' },
      conditions: ['has_resources', 'willing_to_trade'],
      effects: [
        { type: 'resource_transfer', items: 'negotiated' },
        { type: 'relationship', change: '+2' }
      ],
      probability: 0.6
    }
  ],
  events: [
    {
      id: 'seasonal_festival',
      name: 'Harvest Festival',
      type: 'celebration',
      description: 'Annual celebration of the harvest',
      trigger: { type: 'time', season: 'autumn', day: 15 },
      frequency: 365, // once per year
      effects: [
        { type: 'mood_boost', target: 'all_characters', amount: 0.3 },
        { type: 'resource_bonus', resource: 'food', amount: 50 }
      ]
    },
    {
      id: 'wandering_merchant',
      name: 'Merchant Arrival',
      type: 'economic',
      description: 'A traveling merchant visits the village',
      trigger: { type: 'random', probability: 0.1 },
      frequency: 30, // check every 30 days
      effects: [
        { type: 'add_temporary_character', template: 'merchant' },
        { type: 'enable_special_trades', duration: 7 }
      ]
    }
  ]
};

// Example 2: Invalid world configuration with multiple errors
const invalidWorldConfig = {
  // Missing dimensions
  nodes: [], // Empty nodes array
  characters: [
    {
      // Missing required fields
      name: 123, // Invalid type
      attributes: 'invalid', // Should be object
      currentNodeId: 'nonexistent_node'
    },
    {
      id: 'duplicate',
      name: 'Character 1',
      attributes: { strength: 10 }
    },
    {
      id: 'duplicate', // Duplicate ID
      name: 'Character 2',
      attributes: { strength: 'invalid' } // Invalid attribute type
    }
  ],
  interactions: [
    {
      // Missing required fields
      probability: 1.5 // Invalid probability
    }
  ],
  events: [
    {
      id: 'event1',
      name: 'Test Event'
      // Missing trigger
    }
  ]
};

// Example usage functions
function demonstrateValidation() {
  console.log('=== WorldValidator Demonstration ===\n');

  // Validate a complete, valid world
  console.log('1. Validating a complete, valid world configuration:');
  const validResult = WorldValidator.validate(validWorldConfig);
  console.log(`Valid: ${validResult.isValid}`);
  console.log(`Completeness: ${Math.round(validResult.completeness * 100)}%`);
  console.log(`Errors: ${validResult.errors.length}`);
  console.log(`Warnings: ${validResult.warnings.length}\n`);

  // Validate an invalid world
  console.log('2. Validating an invalid world configuration:');
  const invalidResult = WorldValidator.validate(invalidWorldConfig);
  console.log(`Valid: ${invalidResult.isValid}`);
  console.log(`Completeness: ${Math.round(invalidResult.completeness * 100)}%`);
  console.log(`Errors: ${invalidResult.errors.length}`);
  console.log(`Warnings: ${invalidResult.warnings.length}`);
  console.log('First few errors:');
  invalidResult.errors.slice(0, 3).forEach(error => console.log(`  - ${error}`));
  console.log('\n');

  // Demonstrate formatted feedback
  console.log('3. Formatted validation feedback:');
  const feedback = WorldValidator.formatValidationFeedback(invalidResult);
  console.log(`Status: ${feedback.status}`);
  console.log(`Completeness: ${feedback.completeness}%`);
  console.log(`Critical errors: ${feedback.feedback.critical.length}`);
  console.log(`Suggestions: ${feedback.feedback.suggestions.length}`);
  console.log('Sample suggestions:');
  feedback.feedback.suggestions.slice(0, 2).forEach(suggestion => 
    console.log(`  - ${suggestion}`)
  );
  console.log('\n');

  // Demonstrate component validation
  console.log('4. Individual component validation:');
  const dimensionResult = WorldValidator.validateComponent('dimensions', { width: 50, height: 50 });
  console.log(`Dimensions valid: ${dimensionResult.valid}`);
  
  const nodeResult = WorldValidator.validateComponent('nodes', []);
  console.log(`Empty nodes valid: ${nodeResult.valid}`);
  console.log(`Node validation message: ${nodeResult.message}\n`);

  // Demonstrate real-time validation scenario
  console.log('5. Real-time validation scenario (building a world step by step):');
  let buildingWorld = {};
  
  // Step 1: Add dimensions
  buildingWorld.dimensions = { width: 200, height: 150 };
  let stepResult = WorldValidator.validate(buildingWorld);
  console.log(`After adding dimensions - Valid: ${stepResult.isValid}, Completeness: ${Math.round(stepResult.completeness * 100)}%`);
  
  // Step 2: Add nodes
  buildingWorld.nodes = [
    { id: 'node1', name: 'Starting Area', position: { x: 100, y: 75 } }
  ];
  stepResult = WorldValidator.validate(buildingWorld);
  console.log(`After adding nodes - Valid: ${stepResult.isValid}, Completeness: ${Math.round(stepResult.completeness * 100)}%`);
  
  // Step 3: Add characters
  buildingWorld.characters = [
    {
      id: 'hero',
      name: 'Hero Character',
      attributes: { strength: 12, intelligence: 10, charisma: 8 },
      currentNodeId: 'node1'
    }
  ];
  stepResult = WorldValidator.validate(buildingWorld);
  console.log(`After adding characters - Valid: ${stepResult.isValid}, Completeness: ${Math.round(stepResult.completeness * 100)}%`);
  
  console.log('\n=== Demonstration Complete ===');
}

// Export for use in other modules
module.exports = {
  validWorldConfig,
  invalidWorldConfig,
  demonstrateValidation
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateValidation();
}