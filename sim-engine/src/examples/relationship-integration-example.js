/**
 * Integration Example: Relationship Management Architecture
 *
 * This example demonstrates the proper separation of concerns:
 * - MemoryService: Single source of truth for all relationship management
 * - EncounterService: Focused on complex encounter mechanics
 * - Simple interactions: Update relationships directly through MemoryService
 */

import MemoryService from '../application/services/MemoryService.js';
import EncounterService from '../application/services/EncounterService.js';

class RelationshipIntegrationExample {
  constructor() {
    this.memoryService = new MemoryService();
    this.encounterService = new EncounterService();
  }

  /**
   * Example 1: Simple interaction updates relationship directly
   */
  async simpleInteractionExample() {
    console.log('=== Simple Interaction Example ===');

    // Create characters
    const alice = { id: 'alice', name: 'Alice' };
    const bob = { id: 'bob', name: 'Bob' };

    // Simple conversation interaction
    const interaction = {
      type: 'conversation',
      context: 'casual_chat',
      significance: 0.3,
      participants: [alice, bob],
      content: 'They discuss the weather and share a laugh'
    };

    // Update relationship directly through MemoryService
    await this.memoryService.updateRelationship(alice.id, bob.id, interaction);

    // Check relationship status
    const relationship = this.memoryService.getRelationship(alice.id, bob.id);
    console.log('Relationship after simple interaction:', relationship);

    return relationship;
  }

  /**
   * Example 2: Complex encounter with relationship updates
   */
  async complexEncounterExample() {
    console.log('=== Complex Encounter Example ===');

    // Create characters
    const charlie = { id: 'charlie', name: 'Charlie' };
    const dana = { id: 'dana', name: 'Dana' };

    // Create a combat encounter
    const encounterData = {
      id: 'combat_encounter_1',
      name: 'Forest Ambush',
      type: 'combat',
      difficulty: 'medium',
      participants: [charlie, dana],
      turnBased: {
        enabled: true,
        duration: 5,
        sequencing: 'sequential'
      }
    };

    const encounter = this.encounterService.createEncounter(encounterData);

    // Trigger the encounter
    const context = {
      currentTurn: 1,
      nodeId: 'forest_clearing',
      participants: [charlie, dana]
    };

    const encounterInstance = this.encounterService.triggerEncounter(encounter.id, context);

    // Simulate encounter turns
    for (let turn = 1; turn <= 3; turn++) {
      console.log(`Processing turn ${turn}...`);

      // Process encounter mechanics (no relationship logic here)
      this.encounterService.processEncounterTurn(encounterInstance.id, turn);

      // After each turn, update relationships based on encounter actions
      const encounterInteraction = {
        type: 'combat',
        context: 'encounter_turn',
        significance: 0.8, // High significance for combat
        participants: [charlie, dana],
        content: `Combat turn ${turn} - they fight together against enemies`
      };

      // Update relationships through MemoryService
      await this.memoryService.updateRelationship(charlie.id, dana.id, encounterInteraction);

      console.log(`Turn ${turn} completed`);
    }

    // Resolve encounter
    const outcome = this.encounterService.resolveEncounter(encounterInstance.id);
    console.log('Encounter outcome:', outcome);

    // Check final relationship
    const relationship = this.memoryService.getRelationship(charlie.id, dana.id);
    console.log('Relationship after complex encounter:', relationship);

    return relationship;
  }

  /**
   * Example 3: Relationship evolution over multiple interactions
   */
  async relationshipEvolutionExample() {
    console.log('=== Relationship Evolution Example ===');

    const eve = { id: 'eve', name: 'Eve' };
    const frank = { id: 'frank', name: 'Frank' };

    const interactions = [
      {
        type: 'conversation',
        context: 'professional_meeting',
        significance: 0.4,
        participants: [eve, frank],
        content: 'Initial business meeting'
      },
      {
        type: 'trade',
        context: 'merchant_exchange',
        significance: 0.6,
        participants: [eve, frank],
        content: 'Successful trade transaction'
      },
      {
        type: 'conversation',
        context: 'casual_dinner',
        significance: 0.7,
        participants: [eve, frank],
        content: 'Dinner conversation turns personal'
      },
      {
        type: 'collaboration',
        context: 'joint_project',
        significance: 0.9,
        participants: [eve, frank],
        content: 'Work together on important project'
      }
    ];

    console.log('Initial relationship: None');

    for (const interaction of interactions) {
      await this.memoryService.updateRelationship(eve.id, frank.id, interaction);
      const relationship = this.memoryService.getRelationship(eve.id, frank.id);
      console.log(`After ${interaction.type}: ${relationship.type} (bond: ${relationship.bond.toFixed(2)})`);
    }

    // Get detailed relationship history
    const history = this.memoryService.getRelationshipHistory(eve.id, frank.id);
    console.log('Relationship history:', history);

    return history;
  }

  /**
   * Example 4: Relationship decay over time
   */
  async relationshipDecayExample() {
    console.log('=== Relationship Decay Example ===');

    const grace = { id: 'grace', name: 'Grace' };
    const henry = { id: 'henry', name: 'Henry' };

    // Build initial strong relationship
    const initialInteraction = {
      type: 'collaboration',
      context: 'crisis_response',
      significance: 1.0,
      participants: [grace, henry],
      content: 'Work together during crisis'
    };

    await this.memoryService.updateRelationship(grace.id, henry.id, initialInteraction);
    let relationship = this.memoryService.getRelationship(grace.id, henry.id);
    console.log('Initial strong relationship:', relationship);

    // Simulate time passing without interactions
    console.log('Simulating time decay...');
    await this.memoryService.applyRelationshipDecay(grace.id, henry.id, 30); // 30 days

    relationship = this.memoryService.getRelationship(grace.id, henry.id);
    console.log('After 30 days of no contact:', relationship);

    // Refresh relationship with new interaction
    const refreshInteraction = {
      type: 'conversation',
      context: 'catch_up_call',
      significance: 0.5,
      participants: [grace, henry],
      content: 'Catch up after time apart'
    };

    await this.memoryService.updateRelationship(grace.id, henry.id, refreshInteraction);
    relationship = this.memoryService.getRelationship(grace.id, henry.id);
    console.log('After refreshing contact:', relationship);

    return relationship;
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    try {
      await this.simpleInteractionExample();
      console.log('');

      await this.complexEncounterExample();
      console.log('');

      await this.relationshipEvolutionExample();
      console.log('');

      await this.relationshipDecayExample();
      console.log('');

      console.log('=== All Examples Completed Successfully ===');
    } catch (error) {
      console.error('Error running examples:', error);
    }
  }
}

// Export for use in tests or other modules
export default RelationshipIntegrationExample;

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = new RelationshipIntegrationExample();
  example.runAllExamples();
}
