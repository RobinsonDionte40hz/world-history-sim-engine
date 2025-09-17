// src/application/use-cases/simulation/ProcessTurnWithLOD.js

import Character from '../../../domain/entities/Character.js';
import generateBehavior from '../npc/GenerateBehavior.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';
import BasicNeedsService from '../../../domain/services/BasicNeedsService.js';
import NeedConsequenceService from '../../../domain/services/NeedConsequenceService.js';
import ConsequenceLifecycleManager from '../../../domain/services/ConsequenceLifecycleManager.js';
import SettlementService from '../../../domain/services/SettlementService.js';
import CharacterBehaviorModifierService from '../../../domain/services/CharacterBehaviorModifierService.js';

/**
 * Process a complete turn with Level of Detail (LOD) integration
 * @param {Object} worldState - Current world state
 * @param {LODManager} lodManager - LOD manager instance
 * @param {HistoryGenerator} historyGenerator - History generator instance
 * @returns {Object} Updated world state with LOD processing results
 */
const processTurnWithLOD = async (worldState, lodManager, historyGenerator = null) => {
  if (!worldState) {
    throw new Error('Invalid world state');
  }

  if (!lodManager) {
    throw new Error('LODManager is required for LOD-integrated turn processing');
  }

  // Initialize history generator if not provided
  if (!historyGenerator) {
    historyGenerator = new HistoryGenerator();
  }

  // Initialize events array if it doesn't exist
  if (!worldState.events) {
    worldState.events = [];
  }

  // Initialize turn counter if it doesn't exist
  if (!worldState.turn) {
    worldState.turn = 1;
  }

  const turnResults = {
    turn: worldState.turn,
    lodResults: {
      preTurn: null,
      postTurn: null
    },
    characterEvents: [],
    settlementEvents: [],
    crossSettlementEvents: [],
    processingTime: 0
  };

  const startTime = performance.now();

  try {
    // ==================== PRE-TURN LOD PROCESSING ====================
    console.log(`Processing turn ${worldState.turn} - Pre-turn LOD phase`);

    const preTurnLODResult = await lodManager.processPreTurnLOD(worldState);
    turnResults.lodResults.preTurn = preTurnLODResult;

    if (!preTurnLODResult.success) {
      console.warn('Pre-turn LOD processing failed:', preTurnLODResult.error);
    } else {
      // Add LOD events to world state
      if (preTurnLODResult.events && preTurnLODResult.events.length > 0) {
        worldState.events.push(...preTurnLODResult.events);
        console.log(`Pre-turn LOD: ${preTurnLODResult.events.length} events, ${preTurnLODResult.promotions} promotions`);
      }
    }

    // ==================== MAIN TURN PROCESSING ====================
    console.log(`Processing turn ${worldState.turn} - Main turn phase`);

    const mainTurnResult = await processMainTurn(worldState, historyGenerator);
    turnResults.characterEvents = mainTurnResult.characterEvents;
    turnResults.settlementEvents = mainTurnResult.settlementEvents;
    turnResults.crossSettlementEvents = mainTurnResult.crossSettlementEvents;

    // Update world state with main turn results
    worldState = mainTurnResult.updatedWorldState;

    // ==================== POST-TURN LOD PROCESSING ====================
    console.log(`Processing turn ${worldState.turn} - Post-turn LOD phase`);

    const postTurnLODResult = await lodManager.processPostTurnLOD(worldState, turnResults);
    turnResults.lodResults.postTurn = postTurnLODResult;

    if (!postTurnLODResult.success) {
      console.warn('Post-turn LOD processing failed:', postTurnLODResult.error);
    } else {
      // Add LOD events to world state
      if (postTurnLODResult.events && postTurnLODResult.events.length > 0) {
        worldState.events.push(...postTurnLODResult.events);
        console.log(`Post-turn LOD: ${postTurnLODResult.events.length} events, ${postTurnLODResult.demotions} demotions`);
      }
    }

    // ==================== TURN COMPLETION ====================
    worldState.turn++;
    turnResults.processingTime = performance.now() - startTime;

    console.log(`Turn ${worldState.turn - 1} completed in ${turnResults.processingTime.toFixed(2)}ms`);
    console.log(`LOD Summary: +${turnResults.lodResults.preTurn?.promotions || 0} promotions, -${turnResults.lodResults.postTurn?.demotions || 0} demotions`);

    return {
      worldState,
      turnResults
    };

  } catch (error) {
    console.error('Error in LOD-integrated turn processing:', error);
    turnResults.processingTime = performance.now() - startTime;

    return {
      worldState,
      turnResults: {
        ...turnResults,
        error: error.message
      }
    };
  }
};

/**
 * Process the main turn logic (characters and settlements)
 * @private
 */
const processMainTurn = async (worldState, historyGenerator) => {
  const results = {
    characterEvents: [],
    settlementEvents: [],
    crossSettlementEvents: [],
    updatedWorldState: { ...worldState }
  };

  // ==================== CHARACTER PROCESSING ====================
  if (worldState.characters && Array.isArray(worldState.characters)) {
    results.updatedWorldState.characters = [...worldState.characters];

    for (let index = 0; index < worldState.characters.length; index++) {
      const character = worldState.characters[index];

      try {
        // Skip characters that are not active (LOD demoted)
        if (character.lodTier === 'background') {
          continue; // Background characters are processed statistically by LODManager
        }

        let characterInstance = character;

        // Ensure we have a proper Character instance
        if (!(character instanceof Character)) {
          characterInstance = Character.fromJSON(character);
        }

        // Process character turn
        const characterResult = await processCharacterTurn(characterInstance, worldState, historyGenerator);

        if (characterResult.event) {
          results.characterEvents.push(characterResult.event);
          results.updatedWorldState.events.push(characterResult.event);
        }

        // Update character in world state
        results.updatedWorldState.characters[index] = characterResult.updatedCharacter;

      } catch (error) {
        console.error(`Error processing character ${character.name || character.id}:`, error);
      }
    }
  }

  // ==================== SETTLEMENT PROCESSING ====================
  if (worldState.settlements && Array.isArray(worldState.settlements)) {
    results.updatedWorldState.settlements = [...worldState.settlements];

    const basicNeedsService = new BasicNeedsService();
    const needConsequenceService = new NeedConsequenceService();
    const consequenceLifecycleManager = new ConsequenceLifecycleManager();
    const settlementService = new SettlementService();

    for (let index = 0; index < worldState.settlements.length; index++) {
      const settlement = worldState.settlements[index];

      try {
        // Store previous need satisfaction for comparison
        const previousSatisfaction = settlement.needSatisfaction?.current ? {
          overall: settlement.needSatisfaction.current.overall,
          needs: { ...settlement.needSatisfaction.current }
        } : null;

        // Initialize need satisfaction if not already present
        if (!settlement.needSatisfaction) {
          results.updatedWorldState.settlements[index] = settlementService.initializeNeedSatisfaction(settlement);
          continue; // Skip processing this turn, will be processed next turn
        }

        // Calculate need satisfaction for the settlement
        const satisfactionResult = basicNeedsService.calculateSatisfactionLevel(settlement);

        // Generate consequences based on need satisfaction
        const newConsequences = needConsequenceService.generateConsequences(
          satisfactionResult.needs,
          settlement
        );

        // Process settlement consequences
        let updatedSettlement = consequenceLifecycleManager.addConsequencesToSettlement(
          settlement,
          newConsequences
        );

        const lifecycleResults = consequenceLifecycleManager.processConsequenceLifecycle(
          [updatedSettlement],
          {} // No player actions in automated processing
        );

        updatedSettlement = lifecycleResults.processedSettlements[0];
        const cleanupResults = consequenceLifecycleManager.cleanupResolvedConsequences(updatedSettlement);
        updatedSettlement = cleanupResults.settlement;

        // Generate historical events for significant changes
        if (previousSatisfaction) {
          const currentSatisfaction = {
            overall: satisfactionResult.overall,
            needs: satisfactionResult.needs
          };

          const historicalEvents = historyGenerator.generateNeedSatisfactionEvents(
            updatedSettlement,
            previousSatisfaction,
            currentSatisfaction,
            newConsequences
          );

          if (historicalEvents && historicalEvents.length > 0) {
            results.settlementEvents.push(...historicalEvents);
            results.updatedWorldState.events.push(...historicalEvents);
          }
        }

        // Update settlement with new need satisfaction data
        const activeConsequences = updatedSettlement.needSatisfaction?.activeConsequences || [];
        const consequenceIds = activeConsequences.map(c => c.id);
        const eventIds = activeConsequences.map(c => `consequence_${c.id}_${worldState.turn}`);

        results.updatedWorldState.settlements[index] = settlementService.updateNeedSatisfaction(
          updatedSettlement,
          satisfactionResult,
          consequenceIds,
          eventIds
        );

      } catch (error) {
        console.error(`Error processing settlement ${settlement.name || settlement.id}:`, error);
      }
    }
  }

  // ==================== CROSS-SETTLEMENT PROCESSING ====================
  // Process any cross-settlement interactions that occurred during the turn
  if (worldState.settlements && worldState.settlements.length > 1) {
    const crossSettlementResult = await processCrossSettlementInteractions(worldState, historyGenerator);
    results.crossSettlementEvents = crossSettlementResult.events;
    results.updatedWorldState.events.push(...crossSettlementResult.events);
  }

  return results;
};

/**
 * Process a single character's turn
 * @private
 */
const processCharacterTurn = async (character, worldState, historyGenerator) => {
  const result = {
    updatedCharacter: character,
    event: null
  };

  try {
    // Apply evolution over time
    const evolutionService = new EvolutionService();
    const evolvedCharacter = evolutionService.evolveOverTime(character, 1);

    // Apply need satisfaction modifiers
    const behaviorModifierService = new CharacterBehaviorModifierService();
    let modifiedCharacter = evolvedCharacter;

    const characterSettlement = worldState.settlements?.find(settlement =>
      settlement.assignedCharacters?.includes(evolvedCharacter.id) ||
      settlement.id === evolvedCharacter.currentNodeId
    );

    if (characterSettlement) {
      modifiedCharacter = behaviorModifierService.applyNeedSatisfactionModifiers(
        evolvedCharacter,
        characterSettlement,
        worldState
      );
    }

    // Generate and resolve behavior
    const behavior = generateBehavior(modifiedCharacter, worldState);

    if (behavior && behavior.resolution) {
      // Create updated character with interaction tracking
      const characterWithInteraction = new Character({
        ...modifiedCharacter.toJSON(),
        lastInteractionType: behavior.interaction.type
      });

      // Log historical event
      const event = historyGenerator.logEvent({
        timestamp: Date.now(),
        character: characterWithInteraction,
        interaction: behavior.interaction,
        outcome: behavior.resolution.outcome,
        roll: behavior.resolution.roll,
        dc: behavior.resolution.dc,
        decisionContext: behavior.decisionContext
      });

      result.updatedCharacter = characterWithInteraction;
      result.event = event;
    } else {
      result.updatedCharacter = modifiedCharacter;
    }

  } catch (error) {
    console.error(`Error in character turn processing for ${character.name}:`, error);
  }

  return result;
};

/**
 * Process cross-settlement interactions for the turn
 * @private
 */
const processCrossSettlementInteractions = async (worldState, historyGenerator) => {
  const result = {
    events: []
  };

  try {
    // This is a simplified version - in a full implementation, this would
    // check for trade opportunities, diplomatic relations, conflicts, etc.
    // between settlements based on their current state and relationships

    const settlements = worldState.settlements || [];

    // Check for potential trade between settlements
    for (let i = 0; i < settlements.length; i++) {
      for (let j = i + 1; j < settlements.length; j++) {
        const settlementA = settlements[i];
        const settlementB = settlements[j];

        // Simple trade opportunity check (could be more sophisticated)
        const tradeOpportunity = checkTradeOpportunity(settlementA, settlementB, worldState);

        if (tradeOpportunity.shouldTrade) {
          const tradeEvents = historyGenerator.generateCrossSettlementEvents(
            settlementA,
            settlementB,
            'trade',
            {
              volume: tradeOpportunity.volume,
              goods: tradeOpportunity.goods
            }
          );

          result.events.push(...tradeEvents);
        }
      }
    }

  } catch (error) {
    console.error('Error in cross-settlement interaction processing:', error);
  }

  return result;
};

/**
 * Check if there's a trade opportunity between two settlements
 * @private
 */
const checkTradeOpportunity = (settlementA, settlementB, worldState) => {
  // Simple logic: trade if settlements have different resource focuses
  // and are within reasonable distance (simplified)

  const satisfactionA = settlementA.needSatisfaction?.current;
  const satisfactionB = settlementB.needSatisfaction?.current;

  if (!satisfactionA || !satisfactionB) {
    return { shouldTrade: false };
  }

  // Check for complementary needs
  const needsA = satisfactionA.needs || {};
  const needsB = satisfactionB.needs || {};

  // Simple trade logic: if one settlement has surplus in goods that another needs
  const goodsSurplusA = needsA.goods > 0.7;
  const goodsDeficitB = needsB.goods < 0.5;
  const goodsSurplusB = needsB.goods > 0.7;
  const goodsDeficitA = needsA.goods < 0.5;

  if ((goodsSurplusA && goodsDeficitB) || (goodsSurplusB && goodsDeficitA)) {
    return {
      shouldTrade: true,
      volume: Math.floor(Math.random() * 50) + 25, // 25-75 units
      goods: ['goods', 'tools']
    };
  }

  return { shouldTrade: false };
};

export default processTurnWithLOD;