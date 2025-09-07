/**
 * Example Integration: Relationship Management in Turn Processing
 *
 * This example shows how to integrate the MemoryService relationship management
 * into your turn-based simulation system.
 */

import MemoryService from '../domain/services/MemoryService.js';
import EncounterService from './EncounterService.js';

/**
 * Example Simulation Service that integrates relationship management
 */
class ExampleSimulationService {
  constructor() {
    this.memoryService = new MemoryService();
    this.encounterService = new EncounterService(this.memoryService);
    this.worldState = {
      characters: [],
      nodes: [],
      currentTime: 0
    };
  }

  /**
   * Process NPC interactions during a turn
   * @param {Object} character1 - First character
   * @param {Object} character2 - Second character
   * @param {Object} interaction - The interaction that occurred
   * @param {string} outcome - Outcome of the interaction ('positive', 'negative', 'neutral')
   */
  processNPCInteraction(character1, character2, interaction, outcome = 'neutral') {
    console.log(`Processing interaction between ${character1.name} and ${character2.name}`);

    // Your existing interaction processing logic here...
    // (energy costs, attribute changes, etc.)

    // Add relationship updates (new integration)
    this.memoryService.updateRelationship(character1, character2.id, outcome);
    this.memoryService.updateRelationship(character2, character1.id, outcome);

    // Log the relationship changes
    const relationship1 = this.memoryService.calculateRelationshipType(
      character1.relationships?.get(character2.id) || 0
    );
    const relationship2 = this.memoryService.calculateRelationshipType(
      character2.relationships?.get(character1.id) || 0
    );

    console.log(`${character1.name} now sees ${character2.name} as: ${relationship1}`);
    console.log(`${character2.name} now sees ${character1.name} as: ${relationship2}`);

    // Continue with existing logic...
    return {
      success: true,
      relationshipUpdates: {
        [character1.id]: relationship1,
        [character2.id]: relationship2
      }
    };
  }

  /**
   * Process a complete turn with multiple character interactions
   */
  async processTurn() {
    const turnEvents = [];
    let interactionCount = 0;

    // Example: Process interactions between characters in the same location
    for (const node of this.worldState.nodes) {
      const charactersInNode = this.worldState.characters.filter(
        char => char.currentNodeId === node.id
      );

      // Process pairwise interactions
      for (let i = 0; i < charactersInNode.length; i++) {
        for (let j = i + 1; j < charactersInNode.length; j++) {
          const char1 = charactersInNode[i];
          const char2 = charactersInNode[j];

          // Determine if interaction should occur (your existing logic)
          if (this.shouldCharactersInteract(char1, char2)) {
            const interaction = this.determineInteraction(char1, char2);
            const outcome = this.calculateInteractionOutcome(char1, char2, interaction);

            // Process the interaction with relationship updates
            const result = this.processNPCInteraction(char1, char2, interaction, outcome);

            turnEvents.push({
              type: 'character_interaction',
              characters: [char1.id, char2.id],
              interaction: interaction.name,
              outcome,
              relationshipUpdates: result.relationshipUpdates
            });

            interactionCount++;
          }
        }
      }
    }

    return {
      events: turnEvents,
      interactions: interactionCount,
      worldState: this.worldState
    };
  }

  /**
   * Example method to determine if characters should interact
   */
  shouldCharactersInteract(char1, char2) {
    // Your existing logic for determining interactions
    // This could be based on personality, needs, location, etc.
    return Math.random() > 0.7; // 30% chance for demo
  }

  /**
   * Example method to determine what interaction occurs
   */
  determineInteraction(char1, char2) {
    // Your existing logic for selecting interactions
    const interactions = [
      { name: 'greet', type: 'social' },
      { name: 'trade', type: 'economic' },
      { name: 'converse', type: 'social' },
      { name: 'argue', type: 'social' }
    ];

    return interactions[Math.floor(Math.random() * interactions.length)];
  }

  /**
   * Example method to calculate interaction outcome
   */
  calculateInteractionOutcome(char1, char2, interaction) {
    // Your existing logic for determining outcomes
    // This could consider personality compatibility, current relationships, etc.

    // Simple random outcome for demo
    const outcomes = ['positive', 'neutral', 'negative'];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  }

  /**
   * Get current world state
   */
  getCurrentWorldState() {
    return { ...this.worldState };
  }

  /**
   * Get relationship summary for all characters
   */
  getRelationshipSummary() {
    const summary = {};

    this.worldState.characters.forEach(character => {
      if (character.relationships && character.relationships.size > 0) {
        summary[character.id] = {
          name: character.name,
          relationships: Array.from(character.relationships.entries()).map(([targetId, bondValue]) => {
            const targetChar = this.worldState.characters.find(c => c.id === targetId);
            return {
              targetId,
              targetName: targetChar?.name || targetId,
              bondValue,
              relationshipType: this.memoryService.calculateRelationshipType(bondValue)
            };
          })
        };
      }
    });

    return summary;
  }
}

export default ExampleSimulationService;
