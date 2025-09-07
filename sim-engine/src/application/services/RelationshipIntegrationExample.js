/**
 * Usage Example: Integrating Relationship Management
 *
 * This example demonstrates how to use the integrated relationship management
 * in your turn-based simulation.
 */

import ExampleSimulationService from './ExampleSimulationService.js';

// Create simulation service with relationship management
const simulation = new ExampleSimulationService();

// Example characters
const alice = {
  id: 'char_alice',
  name: 'Alice',
  relationships: new Map(),
  currentNodeId: 'town_square'
};

const bob = {
  id: 'char_bob',
  name: 'Bob',
  relationships: new Map(),
  currentNodeId: 'town_square'
};

const charlie = {
  id: 'char_charlie',
  name: 'Charlie',
  relationships: new Map(),
  currentNodeId: 'town_square'
};

// Add characters to world state
simulation.worldState.characters = [alice, bob, charlie];
simulation.worldState.nodes = [{
  id: 'town_square',
  name: 'Town Square'
}];

/**
 * Example 1: Direct NPC Interaction Processing
 */
console.log('=== Example 1: Direct NPC Interaction ===');

// Alice and Bob have a positive interaction
simulation.processNPCInteraction(alice, bob, { name: 'help' }, 'positive');

// Alice and Charlie have a negative interaction
simulation.processNPCInteraction(alice, charlie, { name: 'argue' }, 'negative');

// Bob and Charlie have a neutral interaction
simulation.processNPCInteraction(bob, charlie, { name: 'greet' }, 'neutral');

console.log('\nRelationship Summary:');
console.log(JSON.stringify(simulation.getRelationshipSummary(), null, 2));

/**
 * Example 2: Turn Processing with Multiple Interactions
 */
console.log('\n=== Example 2: Turn Processing ===');

simulation.processTurn().then(result => {
  console.log(`Turn processed with ${result.interactions} interactions`);
  console.log('Events:', result.events);

  console.log('\nFinal Relationship Summary:');
  console.log(JSON.stringify(simulation.getRelationshipSummary(), null, 2));

  /**
   * Example 3: Using Relationship Information for Decision Making
   */
  console.log('\n=== Example 3: Relationship-Based Decisions ===');

  // Check Alice's relationships
  const aliceRelationships = simulation.getRelationshipSummary()[alice.id];
  if (aliceRelationships) {
    aliceRelationships.relationships.forEach(rel => {
      if (rel.relationshipType === 'close_friend') {
        console.log(`${alice.name} considers ${rel.targetName} a close friend (bond: ${rel.bondValue})`);
      } else if (rel.relationshipType === 'hostile') {
        console.log(`${alice.name} is hostile toward ${rel.targetName} (bond: ${rel.bondValue})`);
      }
    });
  }

  // Use relationship information in decision making
  const bobRelationship = aliceRelationships?.relationships.find(r => r.targetId === bob.id);
  if (bobRelationship && bobRelationship.relationshipType === 'close_friend') {
    console.log(`${alice.name} will be more likely to help ${bob.name} in future interactions`);
  }
});

/**
 * Example 4: Memory Service Direct Usage
 */
console.log('\n=== Example 4: Memory Service Integration ===');

const memoryService = simulation.memoryService;

// Update memory for Alice
memoryService.updateMemory(alice, 'interaction_help_bob', 'positive');

// Get memory influence for future interactions
const memoryInfluence = memoryService.getMemoryInfluence(alice, { id: 'interaction_help_bob' });
console.log(`Memory influence for Alice repeating 'help' interaction: ${memoryInfluence}`);

// Calculate relationship types
const bondValue = 75;
const relationshipType = memoryService.calculateRelationshipType(bondValue);
console.log(`Bond value ${bondValue} corresponds to relationship type: ${relationshipType}`);
