// src/application/use-cases/npc/GenerateBehavior.js

import Character from '../../../domain/entities/Character.js';
// import Interaction from '../../../domain/entities/Interaction.js'; // Currently unused
import InteractionResolver from '../../../domain/services/InteractionResolver.js';
import MemoryService from '../../../domain/services/MemoryService.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';
import InteractionManager from '../../../domain/services/InteractionManager.js';
import { getEmotionalModifier } from '../../../shared/utils/EmotionalUtils.js';

const DEBUG_MODE = true;  // Enable for enhanced decision logging

// SIMPLIFIED WEIGHT CALCULATION
const calculateInteractionWeight = (character, interaction, worldState) => {
  let weight = 1.0; // Base weight
  
  // Factor 1: GOAL PRIORITY (Make this DOMINANT)
  if (character.goals?.length > 0) {
    const matchesGoal = character.goals.some(goal => 
      interaction.name.toLowerCase().includes(goal.id.toLowerCase()) ||
      interaction.category?.toLowerCase().includes(goal.id.toLowerCase()) ||
      interaction.tags?.some(tag => tag.toLowerCase().includes(goal.id.toLowerCase())) ||
      (goal.category && interaction.category === goal.category) ||
      // More flexible matching: check if goal relates to interaction type/category
      (goal.id === 'socialize' && (interaction.category === 'social' || interaction.tags?.includes('social'))) ||
      (goal.id === 'learn' && (interaction.category === 'education' || interaction.tags?.includes('learn'))) ||
      (goal.id === 'explore' && (interaction.type === 'movement' || interaction.category === 'exploration'))
    );
    
    if (matchesGoal) {
      weight += 10; // STRONG goal preference
    }
  }
  
  // Factor 2: CRITICAL NEEDS (Override everything except goals)
  const energyPercent = character.energy / character.maxEnergy;
  
  if (interaction.type === 'rest') {
    if (energyPercent < 0.2) weight += 8;  // Critical need
    else if (energyPercent < 0.5) weight += 3;  // Moderate need
    else weight += 0.5;  // Low priority when not needed
  }
  
  // Factor 3: ENVIRONMENTAL SUITABILITY (Simple modifiers)
  const environment = worldState.nodes.find(n => n.id === character.currentNodeId)?.environment;
  if (environment) {
    if (interaction.type === 'rest' && environment.isDangerous()) {
      weight *= 0.1;  // Heavily discourage rest in danger
    }
    if (interaction.type === 'movement' && environment.isDangerous()) {
      weight += 2;  // Encourage leaving dangerous areas
    }
  }
  
  // Factor 4: PERSONALITY INFLUENCE (Simplified)
  if (character.personality?.traits) {
    const traits = character.personality.traits;
    
    // Match interaction to personality
    if (interaction.type === 'social' && traits.get('extrovert')?.value > 0.5) {
      weight += 2;
    }
    if (interaction.type === 'explore' && traits.get('adventurous')?.value > 0.5) {
      weight += 2;
    }
    if (interaction.type === 'rest' && traits.get('lazy')?.value > 0.5) {
      weight += 1;
    }
  }
  
  // Factor 5: MEMORY (Simple positive/negative)
  const memoryService = new MemoryService();
  const memoryScore = memoryService.getMemoryInfluence(character, interaction);
  weight += memoryScore * 2;  // -2 to +2 based on past experience
  
  // Factor 6: EMOTIONAL STATE INFLUENCE (New consciousness-based emotions)
  if (character.consciousness && character.consciousness.getCurrentEmotionalState) {
    const emotionalState = character.consciousness.getCurrentEmotionalState();
    const emotionalModifier = getEmotionalModifier(emotionalState, interaction);
    weight *= emotionalModifier; // 0.1x to 3.0x based on emotional state
    
    // Strong emotional overrides for specific states
    if (emotionalState.primary === 'exhausted' && interaction.type !== 'rest') {
      weight *= 0.2; // Exhausted characters really need rest
    }
    if (emotionalState.primary === 'manic' && interaction.type === 'risky_actions') {
      weight *= 2.0; // Manic characters seek risk
    }
    if (emotionalState.primary === 'angry' && interaction.category === 'social') {
      weight *= 0.3; // Angry characters avoid most social interaction
    }
  }
  
  // Factor 7: NEED-BASED MODIFIERS (From settlement need satisfaction)
  if (character.needBasedInteractionModifiers) {
    const interactionType = interaction.type || interaction.category || 'unknown';
    const modifier = character.needBasedInteractionModifiers[interactionType] || 1.0;
    weight *= modifier;
  }

  // Factor 8: NEED-BASED PRIORITIES (From settlement need satisfaction)
  if (character.needBasedBehaviorChanges) {
    const interactionType = interaction.type || interaction.category || 'unknown';
    
    // Check if interaction matches need-based behavior changes
    if (character.needBasedBehaviorChanges.includes('seek_food') && 
        (interactionType.includes('farm') || interactionType.includes('hunt'))) {
      weight *= 2.0;
    }
    if (character.needBasedBehaviorChanges.includes('seek_water') && 
        interactionType.includes('water')) {
      weight *= 2.0;
    }
    if (character.needBasedBehaviorChanges.includes('seek_shelter') && 
        (interactionType.includes('build') || interactionType.includes('shelter'))) {
      weight *= 1.8;
    }
    if (character.needBasedBehaviorChanges.includes('avoid_strenuous_activity') && 
        (interactionType.includes('build') || interactionType.includes('hunt') || interactionType.includes('fight'))) {
      weight *= 0.3;
    }
  }

  // Factor 9: Content interaction priority boost - THIS IS THE KEY FIX
  // Content interactions should generally be preferred over basic ones
  if (!interaction.isSystemInteraction || interaction.type === 'content' || interaction.constructor?.name === 'ContentInteraction') {
    weight *= 1.5; // Boost weight for meaningful content interactions
  }
  
  // Factor 10: D&D attribute modifiers
  if (character.attributes && interaction.requirements) {
    const attrBonus = calculateAttributeBonus(
      character.attributes,
      interaction.requirements
    );
    weight *= (1 + attrBonus);
  }
  
  // Factor 11: Consciousness state influence
  if (character.consciousness) {
    const consciousnessModifier = calculateConsciousnessInfluence(
      character.consciousness,
      interaction
    );
    weight *= consciousnessModifier;
  }

  // Factor 12: RANDOM VARIATION (Small, for variety)
  weight += Math.random() * 0.5;
  
  // Ensure non-negative
  return Math.max(0.01, weight);
};

/**
 * Helper function to calculate attribute bonus
 */
function calculateAttributeBonus(attributes, requirements) {
  if (!attributes || !requirements) return 0;
  
  let bonus = 0;
  
  // Check if character's attributes exceed requirements
  Object.entries(requirements).forEach(([attr, required]) => {
    if (attributes[attr]) {
      const value = attributes[attr].value || attributes[attr];
      if (value > required) {
        bonus += 0.1 * ((value - required) / required);
      } else if (value < required) {
        bonus -= 0.2; // Penalty for not meeting requirements
      }
    }
  });
  
  return bonus;
}

/**
 * Helper function to calculate consciousness influence
 */
function calculateConsciousnessInfluence(consciousness, interaction) {
  if (!consciousness) return 1.0;
  
  // Higher coherence = better decision making
  const coherence = consciousness.coherence || 0.5;
  
  // Base modifier from coherence
  let modifier = 0.5 + coherence;
  
  // Specific consciousness states might prefer certain interactions
  if (consciousness.state === 'focused' && interaction.type === 'content') {
    modifier *= 1.3;
  } else if (consciousness.state === 'tired' && interaction.type === 'rest') {
    modifier *= 1.5;
  }
  
  return modifier;
}

/**
 * Calculate weights for all interactions based on character state
 */
function calculateInteractionWeights(character, interactions, context) {
  const weights = {};
  
  // Calculate weight for each interaction
  interactions.forEach(interaction => {
    const weight = calculateInteractionWeight(character, interaction, context);
    
    // Use interaction name or ID as key
    const key = interaction.name || interaction.id || interaction.type || 'unknown';
    weights[key] = weight;
  });
  
  // Normalize weights so they sum to approximately 1
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (totalWeight > 0) {
    Object.keys(weights).forEach(key => {
      weights[key] = weights[key] / totalWeight;
    });
  }
  
  return weights;
}

/**
 * Select an interaction based on weighted probabilities
 */
function selectWeightedInteraction(weights) {
  const entries = Object.entries(weights);
  if (entries.length === 0) return null;
  
  // Sort by weight for consistency
  entries.sort((a, b) => b[1] - a[1]);
  
  // Use weighted random selection
  const random = Math.random();
  let cumulative = 0;
  
  for (const [interaction, weight] of entries) {
    cumulative += weight;
    if (random < cumulative) {
      return interaction;
    }
  }
  
  // Fallback to highest weight
  return entries[0][0];
}

/**
 * Generate reasoning for the decision
 */
function generateDecisionReasoning(character, selected, interactionWeights, context) {
  const currentNode = context.nodes.find(n => n.id === character.currentNodeId);
  
  return {
    consciousnessInfluence: {
      frequency: character.consciousness?.frequency || 0,
      coherence: character.consciousness?.coherence || 0,
      emotionalState: character.consciousness?.getCurrentEmotionalState ? 
        character.consciousness.getCurrentEmotionalState() : null
    },
    personalityFactors: character.personality ? {
      dominantTraits: Array.from(character.personality.traits.entries())
        .filter(([_, trait]) => trait.value > 0.6)
        .map(([name, trait]) => ({ name, value: trait.value }))
        .slice(0, 3)
    } : null,
    environmentalFactors: currentNode ? {
      nodeType: currentNode.type,
      climate: currentNode.environmentalProperties?.climate,
      isDangerous: currentNode.environment?.isDangerous?.() || false,
      resources: currentNode.resources
    } : null,
    needFactors: {
      energyLevel: character.energy / character.maxEnergy,
      criticalNeeds: character.energy < (character.maxEnergy * 0.2) ? ['energy'] : [],
      goals: character.goals?.slice(0, 3).map(g => g.id) || []
    }
  };
}

/**
 * Get top alternatives to the selected interaction
 */
function getTopAlternatives(weights, selected, count = 3) {
  const entries = Object.entries(weights)
    .filter(([name, _]) => name !== selected)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);
    
  return entries.map(([name, weight]) => ({ name, weight }));
}

/**
 * Gather all available interactions for a character
 */
function gatherAvailableInteractions(character, worldState) {
  // Ensure we have a proper Character instance
  if (!(character instanceof Character)) {
    console.error('gatherAvailableInteractions received non-Character object:', character);
    throw new Error('Invalid character object passed to gatherAvailableInteractions');
  }

  console.log(`Checking character ${character.name} (ID: ${character.id}) with currentNodeId: ${character.currentNodeId}`);
  console.log(`Available nodes:`, worldState.nodes.map(n => ({ id: n.id, name: n.name })));

  // If character has no currentNodeId, try to assign one from their assignments
  if (!character.currentNodeId && character.assignments?.nodes?.size > 0) {
    const assignedNodeId = Array.from(character.assignments.nodes)[0];
    console.log(`Character has no currentNodeId, assigning from assignments: ${assignedNodeId}`);
    character.currentNodeId = assignedNodeId;
  }

  // If still no currentNodeId, assign to first available node
  if (!character.currentNodeId && worldState.nodes.length > 0) {
    const firstNodeId = worldState.nodes[0].id;
    console.log(`Character has no currentNodeId, assigning to first available node: ${firstNodeId}`);
    character.currentNodeId = firstNodeId;
  }

  const currentNode = worldState.nodes.find(node => node.id === character.currentNodeId);
  if (!currentNode) {
    console.error(`Character ${character.name} has invalid currentNodeId: ${character.currentNodeId}`);
    console.error(`Available node IDs:`, worldState.nodes.map(n => n.id));
    throw new Error(`Character ${character.name} has no valid node (currentNodeId: ${character.currentNodeId})`);
  }

  const interactionManager = new InteractionManager();
  const availableInteractionsData = interactionManager.getAvailableInteractions({
    character,
    world: worldState,
    currentNode
  });

  // IMPORTANT: Ensure we're returning both basic and content interactions
  const interactions = [];
  
  // Add system interactions (basic interactions)
  if (availableInteractionsData.systemInteractions && Array.isArray(availableInteractionsData.systemInteractions)) {
    interactions.push(...availableInteractionsData.systemInteractions);
  }
  
  // Add content interactions - THIS IS THE KEY FIX
  if (availableInteractionsData.contentInteractions && Array.isArray(availableInteractionsData.contentInteractions)) {
    interactions.push(...availableInteractionsData.contentInteractions);
  }

  // Filter available interactions based on character state
  const availableInteractions = interactions.filter(interaction => {
    try {
      // System interactions use InteractionManager's validation
      if (interaction.isSystemInteraction) {
        return interactionManager.canExecuteInteraction ? 
          interactionManager.canExecuteInteraction(interaction, { character, worldState, currentNode }) : 
          true; // Default to true if method doesn't exist
      }

      // Content interactions use canExecute method
      if (interaction.canExecute) {
        const canExecuteResult = interaction.canExecute(character, worldState);
        return canExecuteResult;
      }

      // If no validation method exists, assume it's executable
      console.log(`No validation method found for interaction ${interaction.name}, assuming executable`);
      return true;
    } catch (error) {
      console.warn(`Error checking if interaction can execute:`, error.message);
      return false;
    }
  });

  console.log(
    `${character.name} has ${availableInteractions.length} total interactions available:`,
    availableInteractions.map(i => i.name || i.type || 'unknown')
  );
  
  // Log breakdown by type for debugging
  const systemCount = availableInteractions.filter(i => i.isSystemInteraction).length;
  const contentCount = availableInteractions.filter(i => !i.isSystemInteraction).length;
  console.log(`  - ${systemCount} system interactions, ${contentCount} content interactions`);

  return availableInteractions;
}// Emergency handler (separate from main weighting)
function handleEmergency(character, interactions, worldState) {
  // Only override for TRUE emergencies
  if (character.energy < 5) {
    return interactions.find(i => i.constructor.name === 'RestInteraction');
  }
  if (character.health < 10) {
    return interactions.find(i => i.constructor.name === 'RestInteraction' || i.constructor.name === 'MovementInteraction');
  }
  return null;
}

const generateBehavior = (character, worldState) => {
  if (!(character instanceof Character)) {
    throw new Error('Invalid character');
  }
  
  // Step 1: Gather all available interactions
  const availableInteractions = gatherAvailableInteractions(character, worldState);
  
  if (!availableInteractions.length) return null;
  
  // CRITICAL OVERRIDE: Handle emergencies first
  const emergency = handleEmergency(character, availableInteractions, worldState);
  if (emergency) return executeInteraction(character, emergency, worldState);
  
  // Step 2: Calculate weights for ALL interactions (not just basic ones)
  const interactionWeights = calculateInteractionWeights(
    character,
    availableInteractions,
    worldState
  );
  
  // Debug logging
  console.log(
    `${character.name} interaction weights:`,
    Object.entries(interactionWeights)
      .sort((a, b) => b[1] - a[1])
      .map(([name, weight]) => `${name}: ${weight.toFixed(2)}`)
  );
  
  // Step 3: Select interaction based on weights
  const selected = selectWeightedInteraction(interactionWeights);
  
  // Step 4: Generate reasoning for the decision
  const reasoning = generateDecisionReasoning(
    character,
    selected,
    interactionWeights,
    worldState
  );
  
  // Find the actual interaction object for the selected name
  const selectedInteraction = availableInteractions.find(i => 
    (i.name || i.id || i.type || 'unknown') === selected
  );
  
  if (!selectedInteraction) return null;

  // Enhanced Decision Logging - Store decision reasoning
  const decisionContext = {
    timestamp: worldState.time || Date.now(),
    availableInteractions: Object.entries(interactionWeights).slice(0, 10).map(([name, weight]) => ({ 
      name, 
      weight,
      type: availableInteractions.find(i => (i.name || i.id || i.type || 'unknown') === name)?.type || 'unknown'
    })),
    selectedInteraction: {
      name: selected,
      weight: interactionWeights[selected] || 0,
      type: selectedInteraction.type || 'unknown'
    },
    reasoning: reasoning,
    topAlternatives: getTopAlternatives(interactionWeights, selected, 3)
  };

  // Store decision in character's decision history
  if (!character.decisionHistory) {
    character.decisionHistory = [];
  }
  character.decisionHistory.push(decisionContext);
  
  // Limit decision history to last 50 decisions to prevent memory bloat
  if (character.decisionHistory.length > 50) {
    character.decisionHistory = character.decisionHistory.slice(-50);
  }

  if (DEBUG_MODE) {
    console.log(`${character.name} decision context:`, {
      selected: decisionContext.selectedInteraction.name,
      reasoning: decisionContext.reasoning,
      topAlternatives: decisionContext.topAlternatives
    });
  }

  // Act: Execute the selected interaction
  return executeInteraction(character, selectedInteraction, worldState);
};

// Helper function to execute an interaction
function executeInteraction(character, selectedInteraction, worldState) {
  const interactionResolver = new InteractionResolver();
  const evolutionService = new EvolutionService();
  const historyGenerator = new HistoryGenerator();

  let branch = null;
  let resolution = null;

  try {
    // Use the interaction directly - it should already be a proper instance from InteractionManager
    console.log(`Executing interaction: ${selectedInteraction.name} (type: ${selectedInteraction.constructor.name})`);

    // Step 1: Select a branch (works for both system and content interactions)
    if (selectedInteraction.selectBranch) {
      branch = selectedInteraction.selectBranch(character);
    } else if (selectedInteraction.branches && selectedInteraction.branches.length > 0) {
      // Fallback: use first available branch
      branch = selectedInteraction.branches[0];
    }

    // Step 2: Resolve the interaction
    if (branch) {
      resolution = interactionResolver.resolve(character, selectedInteraction, branch.id, worldState);
    } else {
      // Create a basic resolution for interactions without branches
      resolution = {
        success: true,
        outcome: 'completed',
        message: `${character.name} completed ${selectedInteraction.name || selectedInteraction.type || 'an interaction'}`,
        branchId: null,
        roll: null,
        dc: null
      };
    }

    // Step 3: Apply any direct effects from the interaction
    if (selectedInteraction.execute) {
      selectedInteraction.execute(character, worldState);
    }

    // Step 4: Evolve character based on interaction
    if (resolution && resolution.success) {
      evolutionService.evolveFromInteraction(character, selectedInteraction, resolution.outcome);
    }

    // Step 5: Log the event to history (ALWAYS log, even for basic interactions)
    const latestDecision = character.decisionHistory?.[character.decisionHistory.length - 1];

    historyGenerator.logEvent({
      timestamp: worldState.time || Date.now(),
      character,
      interaction: selectedInteraction,
      outcome: resolution?.outcome || 'completed',
      roll: resolution?.roll || null,
      dc: resolution?.dc || null,
      message: resolution?.message || `${character.name} performed ${selectedInteraction.name || selectedInteraction.type}`,
      decisionContext: latestDecision ? {
        reasoningFactors: latestDecision.reasoning,
        alternativeOptions: latestDecision.availableInteractions.slice(0, 5),
        selectionWeight: latestDecision.selectedInteraction.weight
      } : null
    });

  } catch (error) {
    console.error(`Error executing interaction for ${character.name}:`, error);
    console.error(`Interaction details:`, {
      name: selectedInteraction.name,
      type: selectedInteraction.type,
      constructor: selectedInteraction.constructor.name,
      hasSelectBranch: !!selectedInteraction.selectBranch,
      hasIsAvailable: !!selectedInteraction.isAvailable,
      hasCanExecute: !!selectedInteraction.canExecute,
      hasMetRequirements: !!selectedInteraction.meetsRequirements
    });
    
    // Create fallback resolution
    resolution = {
      success: false,
      outcome: 'error',
      message: `Error executing ${selectedInteraction.name || selectedInteraction.type}: ${error.message}`,
      branchId: branch?.id || null,
      roll: null,
      dc: null
    };

    // Still log the failed attempt
    historyGenerator.logEvent({
      timestamp: worldState.time || Date.now(),
      character,
      interaction: selectedInteraction,
      outcome: 'error',
      message: resolution.message,
      error: error.message
    });
  }

  return {
    interaction: selectedInteraction,
    branchId: branch?.id,
    resolution,
  };
}

export default generateBehavior;