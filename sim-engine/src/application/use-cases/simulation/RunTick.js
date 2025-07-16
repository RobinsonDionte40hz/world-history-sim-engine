// src/application/use-cases/simulation/RunTick.js

import Character from '../../../domain/entities/Character.js';
import generateBehavior from '../npc/GenerateBehavior.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';

const runTick = (worldState) => {
  if (!worldState || !Array.isArray(worldState.npcs) || !Array.isArray(worldState.nodes)) {
    throw new Error('Invalid world state');
  }

  worldState.time = worldState.time || 0;

  // Adjust tick interval based on average coherence (quantum-inspired)
  const avgCoherence = worldState.npcs.reduce((sum, npc) => sum + (npc.consciousness?.coherence || 0), 0) / worldState.npcs.length;
  const tickDelay = Math.max(100, 1000 - (avgCoherence * 900));  // 100-1000ms, higher coherence slows time

  worldState.npcs.forEach((npc, index) => {
    if (!(npc instanceof Character)) {
      console.error('Invalid character in world state at index', index, npc);
      // Try to recover by converting to Character instance
      try {
        npc = Character.fromJSON(npc);
        worldState.npcs[index] = npc;
      } catch (error) {
        console.error('Failed to convert NPC to Character instance:', error);
        return; // Skip this NPC
      }
    }

    // Create a new Character instance with updated basic state
    // This maintains the Character class while updating properties
    const updatedNpc = new Character({
      ...npc.toJSON(), // Get all current properties
      // Update basic properties
      energy: Math.max(0, Math.min(100, (npc.energy || 50) - 1)),
      health: Math.max(0, Math.min(100, npc.health || 100)),
      mood: Math.max(0, Math.min(100, npc.mood || 50))
    });

    // Evolve over time - now passing a proper Character instance
    const evolutionService = new EvolutionService();
    const evolvedNpc = evolutionService.evolveOverTime(updatedNpc, 1);  // 1 tick elapsed

    // Generate and resolve behavior
    const behavior = generateBehavior(evolvedNpc, worldState);
    if (behavior) {
      // Create a new Character instance with the interaction type tracked
      const npcWithInteraction = new Character({
        ...evolvedNpc.toJSON(),
        lastInteractionType: behavior.interaction.type
      });

      // Log history
      new HistoryGenerator().logEvent({
        timestamp: worldState.time,
        character: npcWithInteraction,
        interaction: behavior.interaction,
        outcome: behavior.resolution.outcome,
        roll: behavior.resolution.roll,
        dc: behavior.resolution.dc,
      });

      // Update the reference to the new character instance
      worldState.npcs[index] = npcWithInteraction;
    } else {
      // Update even if no behavior was generated
      worldState.npcs[index] = evolvedNpc;
    }
  });

  worldState.time++;

  return { ...worldState, tickDelay };  // Return updated state with delay for UI
};

export default runTick;