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
    let characterInstance = npc;

    // Ensure we have a proper Character instance
    if (!(npc instanceof Character)) {
      console.warn(`Converting plain object to Character instance at index ${index}:`, npc);
      try {
        characterInstance = Character.fromJSON(npc);
        console.log(`Successfully converted character ${characterInstance.name} to Character instance`);
      } catch (error) {
        console.error(`Failed to convert NPC to Character instance at index ${index}:`, error);
        console.error('NPC data:', JSON.stringify(npc, null, 2));
        return; // Skip this NPC
      }
    }

    // Ensure character has a valid currentNodeId
    if (!characterInstance.currentNodeId) {
      // Try to assign from assignments first
      if (characterInstance.assignments?.nodes?.size > 0) {
        const assignedNodeId = Array.from(characterInstance.assignments.nodes)[0];
        const characterData = characterInstance.toJSON();
        characterData.currentNodeId = assignedNodeId; // Explicitly set to ensure override
        characterInstance = new Character(characterData);
        console.log(`Assigned character ${characterInstance.name} to node ${assignedNodeId} from assignments`);
      }
      // Fallback to first available node
      else if (worldState.nodes.length > 0) {
        const firstNodeId = worldState.nodes[0].id;
        const characterData = characterInstance.toJSON();
        characterData.currentNodeId = firstNodeId; // Explicitly set to ensure override
        characterInstance = new Character(characterData);
        console.log(`Assigned character ${characterInstance.name} to first available node ${firstNodeId}`);
      }
    }

    // Create a new Character instance with updated basic state
    const updatedNpc = new Character({
      ...characterInstance.toJSON(),
      // Update basic properties
      energy: Math.max(0, Math.min(100, (characterInstance.energy || 50) - 1)),
      health: Math.max(0, Math.min(100, characterInstance.health || 100)),
      mood: Math.max(0, Math.min(100, characterInstance.mood || 50))
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