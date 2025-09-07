// src/application/use-cases/simulation/RunTick.js

import Character from '../../../domain/entities/Character.js';
import generateBehavior from '../npc/GenerateBehavior.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';
import BasicNeedsService from '../../../domain/services/BasicNeedsService.js';
import NeedConsequenceService from '../../../domain/services/NeedConsequenceService.js';
import SettlementService from '../../../domain/services/SettlementService.js';
import CharacterBehaviorModifierService from '../../../domain/services/CharacterBehaviorModifierService.js';

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

    // Apply need satisfaction modifiers to character behavior
    const behaviorModifierService = new CharacterBehaviorModifierService();
    let modifiedNpc = evolvedNpc;
    
    // Find the settlement the character is in
    const characterSettlement = worldState.settlements?.find(settlement => 
      settlement.assignedCharacters?.includes(evolvedNpc.id) || 
      settlement.id === evolvedNpc.currentNodeId
    );
    
    if (characterSettlement) {
      modifiedNpc = behaviorModifierService.applyNeedSatisfactionModifiers(
        evolvedNpc, 
        characterSettlement, 
        worldState
      );
    }

    // Generate and resolve behavior
    const behavior = generateBehavior(modifiedNpc, worldState);
    if (behavior && behavior.resolution) {
      // Create a new Character instance with the interaction type tracked
      const npcWithInteraction = new Character({
        ...modifiedNpc.toJSON(),
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
      worldState.npcs[index] = modifiedNpc;
    }
  });

  // Process settlements with need satisfaction calculations
  if (worldState.settlements && Array.isArray(worldState.settlements)) {
    const basicNeedsService = new BasicNeedsService();
    const needConsequenceService = new NeedConsequenceService();
    const settlementService = new SettlementService();

    worldState.settlements.forEach((settlement, index) => {
      try {
        // Initialize need satisfaction if not already present
        if (!settlement.needSatisfaction) {
          worldState.settlements[index] = settlementService.initializeNeedSatisfaction(settlement);
          settlement = worldState.settlements[index];
        }

        // Calculate need satisfaction for the settlement
        const satisfactionResult = basicNeedsService.calculateSatisfactionLevel(settlement);
        
        // Generate consequences based on need satisfaction
        const consequences = needConsequenceService.generateConsequences(
          satisfactionResult.needs,
          settlement
        );

        // Generate historical events for significant changes
        const eventIds = [];
        if (consequences && consequences.length > 0) {
          consequences.forEach(consequence => {
            const eventId = `consequence_${consequence.id}_${worldState.time}`;
            eventIds.push(eventId);
          });
        }

        // Update settlement with new need satisfaction data
        const consequenceIds = consequences.map(c => c.id);
        worldState.settlements[index] = settlementService.updateNeedSatisfaction(
          settlement,
          satisfactionResult,
          consequenceIds,
          eventIds
        );

      } catch (error) {
        console.error(`Error processing settlement ${settlement.name || settlement.id}:`, error);
        // Continue processing other settlements even if one fails
      }
    });
  }

  worldState.time++;

  return { ...worldState, tickDelay };  // Return updated state with delay for UI
};

export default runTick;