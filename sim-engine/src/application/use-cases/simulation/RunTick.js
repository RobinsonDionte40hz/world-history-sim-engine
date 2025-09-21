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

// Import consciousness system services
import { EnhancedConsciousnessState } from '../../../domain/value-objects/EnhancedConsciousnessState.js';
import BehavioralStateService from '../../../domain/services/BehavioralStateService.js';
import EventSignificanceService from '../../../domain/services/EventSignificanceService.js';
import ConsciousnessUpdateService from '../../../domain/services/ConsciousnessUpdateService.js';
import SignificantMemoryService from '../../../domain/services/SignificantMemoryService.js';
import ConsciousnessCheckpointService from '../../../domain/services/ConsciousnessCheckpointService.js';
import BatchProcessingService from '../../../domain/services/BatchProcessingService.js';
import ConsciousnessConfigurationService from '../../../domain/services/ConsciousnessConfigurationService.js';
import ConsciousnessErrorHandlingService from '../../../domain/services/ConsciousnessErrorHandlingService.js';
import MemoryManagementService from '../../../domain/services/MemoryManagementService.js';

/**
 * Initialize consciousness system services
 */
function initializeConsciousnessServices() {
  const errorHandler = new ConsciousnessErrorHandlingService();
  const logger = console; // Use console for logging

  return {
    behavioralStateService: new BehavioralStateService(null, logger, errorHandler),
    eventSignificanceService: new EventSignificanceService(),
    consciousnessUpdateService: new ConsciousnessUpdateService(null, logger, errorHandler),
    significantMemoryService: new SignificantMemoryService(logger, errorHandler),
    consciousnessCheckpointService: new ConsciousnessCheckpointService(logger, errorHandler),
    batchProcessingService: new BatchProcessingService(logger, errorHandler),
    configurationService: new ConsciousnessConfigurationService(),
    memoryManagementService: new MemoryManagementService(logger, errorHandler),
    errorHandler,
    logger
  };
}

/**
 * Process consciousness updates for all characters in the world state
 */
async function processConsciousnessUpdates(worldState, services, historyGenerator) {
  const {
    behavioralStateService,
    eventSignificanceService,
    significantMemoryService,
    batchProcessingService,
    memoryManagementService
  } = services;

  // Collect all consciousness update operations
  const updateOperations = [];

  worldState.npcs.forEach((npc, index) => {
    try {
      // Ensure character has consciousness state
      if (!npc.consciousness) {
        npc.consciousness = new EnhancedConsciousnessState({
          baseFrequency: 7.5 + (Math.random() - 0.5) * 2, // 6.5-8.5 Hz
          baseCoherence: 0.5 + Math.random() * 0.4 // 0.5-0.9 coherence
        });
      }

      // Ensure character has significant memories array
      if (!npc.significantMemories) {
        npc.significantMemories = [];
      }

      // Process consciousness updates based on character state
      const consciousnessEvents = generateConsciousnessEvents(npc, worldState);

      consciousnessEvents.forEach(event => {
        updateOperations.push({
          character: npc,
          event,
          characterIndex: index
        });
      });

    } catch (error) {
      services.errorHandler.handleOperationFailure(error, {
        operation: 'consciousness_initialization',
        characterId: npc.id,
        characterName: npc.name
      });
    }
  });

  // Process updates in batches for better performance
  if (updateOperations.length > 0) {
    const batchResults = await batchProcessingService.processParallelUpdates(
      updateOperations,
      {
        batchSize: 10, // Process 10 characters at a time
        concurrency: 3  // 3 concurrent batches
      }
    );

    // Process successful updates for additional logic
    if (batchResults.successfulUpdates > 0) {
      for (const updateResult of batchResults.updateResults) {
        if (updateResult.success && updateResult.updated) {
          // Find the original update request to get character and event
          const originalRequest = updateOperations.find(op =>
            op.character.id === updateResult.characterId &&
            op.event.type === updateResult.eventType
          );

          if (originalRequest) {
            const { character, event } = originalRequest;

            // Check event significance
            const significance = eventSignificanceService.calculateEventSignificance(event, {
              character,
              worldState
            });

            if (significance >= 0.3) { // Significance threshold
              // Regenerate behavioral state
              character.consciousness.behavioralState =
                behavioralStateService.generateBehavioralState(character);

              // Add to significant memories if highly significant
              if (significance >= 0.7) {
                significantMemoryService.addMemoryIfSignificant(character, {
                  type: event.type,
                  description: event.description || `${event.type} event`,
                  significance,
                  emotionalImpact: event.emotionalImpact || 0.5,
                  outcome: event.outcome || 'experienced',
                  timestamp: Date.now(),
                  context: event.context || {}
                });
              }

              // Log consciousness event
              if (historyGenerator) {
                historyGenerator.logConsciousnessEvent({
                  timestamp: worldState.time,
                  character,
                  event,
                  significance,
                  consciousnessChanges: updateResult.changes
                });
              }
            }
          }
        }
      }
    }
  }
  try {
    memoryManagementService.performWorldLevelCleanup(worldState);
  } catch (error) {
    services.logger.warn('Memory management cleanup failed:', error);
  }
}

/**
 * Generate consciousness-relevant events based on character state
 */
function generateConsciousnessEvents(character, worldState) {
  const events = [];

  // Energy-based consciousness events
  const energyPercent = character.energy / (character.maxEnergy || 100);
  if (energyPercent < 0.3) {
    events.push({
      type: 'energy_crisis',
      description: 'Character is experiencing severe fatigue',
      emotionalImpact: 0.8,
      outcome: 'negative',
      context: { energyLevel: energyPercent }
    });
  } else if (energyPercent > 0.9) {
    events.push({
      type: 'high_energy',
      description: 'Character is feeling energetic and alert',
      emotionalImpact: 0.6,
      outcome: 'positive',
      context: { energyLevel: energyPercent }
    });
  }

  // Health-based consciousness events
  const healthPercent = character.health / (character.maxHealth || 100);
  if (healthPercent < 0.4) {
    events.push({
      type: 'health_crisis',
      description: 'Character is in poor health',
      emotionalImpact: 0.9,
      outcome: 'negative',
      context: { healthLevel: healthPercent }
    });
  }

  // Mood-based consciousness events
  const moodPercent = character.mood / 100;
  if (moodPercent < 0.3) {
    events.push({
      type: 'low_mood',
      description: 'Character is feeling depressed',
      emotionalImpact: 0.7,
      outcome: 'negative',
      context: { moodLevel: moodPercent }
    });
  } else if (moodPercent > 0.8) {
    events.push({
      type: 'high_mood',
      description: 'Character is feeling euphoric',
      emotionalImpact: 0.8,
      outcome: 'positive',
      context: { moodLevel: moodPercent }
    });
  }

  // Goal achievement events
  if (character.goals && character.goals.length > 0) {
    const completedGoals = character.goals.filter(goal => goal.completed);
    if (completedGoals.length > 0) {
      events.push({
        type: 'goal_achievement',
        description: `Character achieved ${completedGoals.length} goal(s)`,
        emotionalImpact: 0.8,
        outcome: 'positive',
        context: { completedGoals: completedGoals.length }
      });
    }
  }

  // Social interaction events (based on recent interactions)
  if (character.lastInteractionType === 'social') {
    events.push({
      type: 'social_interaction',
      description: 'Character engaged in social interaction',
      emotionalImpact: 0.5,
      outcome: character.mood > 50 ? 'positive' : 'neutral',
      context: { interactionType: 'social' }
    });
  }

  // Environmental influence events
  const currentNode = worldState.nodes.find(n => n.id === character.currentNodeId);
  if (currentNode) {
    if (currentNode.environmentalProperties?.climate === 'harsh') {
      events.push({
        type: 'environmental_stress',
        description: 'Character is in a harsh environment',
        emotionalImpact: 0.4,
        outcome: 'negative',
        context: { environment: 'harsh' }
      });
    } else if (currentNode.environmentalProperties?.climate === 'pleasant') {
      events.push({
        type: 'environmental_comfort',
        description: 'Character is in a pleasant environment',
        emotionalImpact: 0.3,
        outcome: 'positive',
        context: { environment: 'pleasant' }
      });
    }
  }

  return events;
}

const runTick = async (worldState) => {
  if (!worldState || !Array.isArray(worldState.npcs) || !Array.isArray(worldState.nodes)) {
    throw new Error('Invalid world state');
  }

  worldState.time = worldState.time || 0;

  // Initialize events array if it doesn't exist
  if (!worldState.events) {
    worldState.events = [];
  }

  // Initialize consciousness system services
  const consciousnessServices = initializeConsciousnessServices();

  // Create a shared history generator instance for this tick
  const historyGenerator = new HistoryGenerator();

  // Adjust tick interval based on average coherence (quantum-inspired)
  const avgCoherence = worldState.npcs.reduce((sum, npc) => sum + (npc.consciousness?.coherence || 0), 0) / worldState.npcs.length;
  const tickDelay = Math.max(100, 1000 - (avgCoherence * 900));  // 100-1000ms, higher coherence slows time

  // Process consciousness updates for all characters
  await processConsciousnessUpdates(worldState, consciousnessServices, historyGenerator);

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
        characterInstance = Character.fromJSON(characterData);
        console.log(`Assigned character ${characterInstance.name} to node ${assignedNodeId} from assignments`);
      }
      // Fallback to first available node
      else if (worldState.nodes.length > 0) {
        const firstNodeId = worldState.nodes[0].id;
        const characterData = characterInstance.toJSON();
        characterData.currentNodeId = firstNodeId; // Explicitly set to ensure override
        characterInstance = Character.fromJSON(characterData);
        console.log(`Assigned character ${characterInstance.name} to first available node ${firstNodeId}`);
      }
    }

    // Create a new Character instance with updated basic state
    const updatedNpc = Character.fromJSON({
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
      const npcWithInteraction = Character.fromJSON({
        ...modifiedNpc.toJSON(),
        lastInteractionType: behavior.interaction.type
      });

      // Log history using shared instance
      const event = historyGenerator.logEvent({
        timestamp: worldState.time,
        character: npcWithInteraction,
        interaction: behavior.interaction,
        outcome: behavior.resolution.outcome,
        roll: behavior.resolution.roll,
        dc: behavior.resolution.dc,
      });

      // Add event to world state if it was created
      if (event) {
        worldState.events.push(event);
      }

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

        // Filter out any undefined consequences
        const validConsequences = newConsequences.filter(c => c && c.id);

        // Add new consequences to the settlement
        let updatedSettlement = consequenceLifecycleManager.addConsequencesToSettlement(
          settlement,
          validConsequences
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
            validConsequences
          );

          // Add historical events to world state
          if (historicalEvents && historicalEvents.length > 0) {
            worldState.events.push(...historicalEvents);
            console.log(`Generated ${historicalEvents.length} historical events for ${updatedSettlement.name}`);
          }
        }

        // Update settlement with new need satisfaction data
        const consequenceIds = validConsequences.map(c => c.id);
        const eventIds = validConsequences.map(c => `consequence_${c.id}_${worldState.time}`);
        
        // Create satisfactionResult without consequences to avoid duplication
        // since we already handled consequence generation separately
        const satisfactionResultForUpdate = {
          ...satisfactionResult,
          consequences: [] // Remove duplicate consequences
        };
        
        worldState.settlements[index] = settlementService.updateNeedSatisfaction(
          updatedSettlement,
          satisfactionResultForUpdate,
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

  // Log summary of events generated this tick
  const newEventsCount = worldState.events ? worldState.events.filter(e => e.timestamp === worldState.time - 1).length : 0;
  console.log(`Turn ${worldState.time}: Generated ${newEventsCount} events total`);

  return { ...worldState, tickDelay };  // Return updated state with delay for UI
};

export default runTick;