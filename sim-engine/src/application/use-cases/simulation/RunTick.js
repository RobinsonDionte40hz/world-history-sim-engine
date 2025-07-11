// src/application/use-cases/simulation/RunTick.js

import Character from '../../domain/entities/Character.js';
import generateBehavior from '../npc/GenerateBehavior.js';
import EvolutionService from '../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../domain/services/HistoryGenerator.js';

const runTick = (worldState) => {
  if (!worldState || !Array.isArray(worldState.npcs) || !Array.isArray(worldState.nodes)) {
    throw new Error('Invalid world state');
  }

  worldState.time = worldState.time || 0;

  // Adjust tick interval based on average coherence (quantum-inspired)
  const avgCoherence = worldState.npcs.reduce((sum, npc) => sum + (npc.consciousness?.coherence || 0), 0) / worldState.npcs.length;
  const tickDelay = Math.max(100, 1000 - (avgCoherence * 900));  // 100-1000ms, higher coherence slows time

  worldState.npcs.forEach(npc => {
    if (!(npc instanceof Character)) {
      throw new Error('Invalid character in world state');
    }

    // Update basic state (reused from old updateCharacter)
    npc.energy = Math.max(0, Math.min(100, npc.energy - 1));
    npc.health = Math.max(0, Math.min(100, npc.health));
    npc.mood = Math.max(0, Math.min(100, npc.mood));

    // Evolve over time
    new EvolutionService().evolveOverTime(npc, 1);  // 1 tick elapsed

    // Generate and resolve behavior
    const behavior = generateBehavior(npc, worldState);
    if (behavior) {
      npc.lastInteractionType = behavior.interaction.type;  // Track for evolution

      // Log history
      new HistoryGenerator().logEvent({
        timestamp: worldState.time,
        character: npc,
        interaction: behavior.interaction,
        outcome: behavior.resolution.outcome,
        roll: behavior.resolution.roll,
        dc: behavior.resolution.dc,
      });
    }
  });

  worldState.time++;

  return { ...worldState, tickDelay };  // Return updated state with delay for UI
};

export default runTick;