// src/application/use-cases/simulation/RunTick.js

import Character from '../../../domain/entities/Character.js';
import generateBehavior from '../npc/GenerateBehavior.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';
import BasicNeedsService from '../../../domain/services/BasicNeedsService.js';
import NeedConsequenceService from '../../../domain/services/NeedConsequenceService.js';
import ConsequenceLifecycleManager from '../../../domain/services/ConsequenceLifecycleManager.js';
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
    const consequenceLifecycleManager = new ConsequenceLifecycleManager();
    const settlementService = new SettlementService();
    const historyGenerator = new HistoryGenerator();

    worldState.settlements.forEach((settlement, index) => {
      try {
        // Store previous need satisfaction for comparison
        const previousSatisfaction = settlement.needSatisfaction?.current ? {
          overall: settlement.needSatisfaction.current.overall,
          needs: { ...settlement.needSatisfaction.current }
        } : null;

        // Initialize need satisfaction if not already present
        if (!settlement.needSatisfaction) {
          worldState.settlements[index] = settlementService.initializeNeedSatisfaction(settlement);
          settlement = worldState.settlements[index];
        }

        // Calculate need satisfaction for the settlement
        const satisfactionResult = basicNeedsService.calculateSatisfactionLevel(settlement);
        
        // Generate consequences based on need satisfaction
        const newConsequences = needConsequenceService.generateConsequences(
          satisfactionResult.needs,
          settlement
        );

        // Add new consequences to the settlement
        let updatedSettlement = consequenceLifecycleManager.addConsequencesToSettlement(
          settlement,
          newConsequences
        );

        // Process consequence lifecycle (aging, resolution, cleanup)
        const lifecycleResults = consequenceLifecycleManager.processConsequenceLifecycle(
          [updatedSettlement],
          {} // No player actions in automated processing
        );

        // Update settlement with processed consequences
        updatedSettlement = lifecycleResults.processedSettlements[0];

        // Clean up resolved/expired consequences
        const cleanupResults = consequenceLifecycleManager.cleanupResolvedConsequences(updatedSettlement);
        updatedSettlement = cleanupResults.settlement;

        // Generate historical events for significant changes
        if (previousSatisfaction) {
          const currentSatisfaction = {
            overall: satisfactionResult.overall,
            needs: satisfactionResult.needs
          };

          // Generate and save historical events
          const historicalEvents = historyGenerator.generateNeedSatisfactionEvents(
            updatedSettlement,
            previousSatisfaction,
            currentSatisfaction,
            newConsequences
          );

          // Log the number of events generated for debugging
          if (historicalEvents.length > 0) {
            console.log(`Generated ${historicalEvents.length} historical events for ${updatedSettlement.name}`);
          }
        }

        // Update settlement with new need satisfaction data
        const activeConsequences = updatedSettlement.needSatisfaction?.activeConsequences || [];
        const consequenceIds = activeConsequences.map(c => c.id);
        const eventIds = activeConsequences.map(c => `consequence_${c.id}_${worldState.time}`);
        
        worldState.settlements[index] = settlementService.updateNeedSatisfaction(
          updatedSettlement,
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