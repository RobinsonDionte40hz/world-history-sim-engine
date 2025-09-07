// src/application/use-cases/npc/GenerateBehavior.js

import Character from '../../../domain/entities/Character.js';
// import Interaction from '../../../domain/entities/Interaction.js'; // Currently unused
import InteractionResolver from '../../../domain/services/InteractionResolver.js';
import MemoryService from '../../../domain/services/MemoryService.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';
import InteractionManager from '../../../domain/services/InteractionManager.js';
import CharacterBehaviorModifierService from '../../../domain/services/CharacterBehaviorModifierService.js';

const DEBUG_MODE = false;

// SIMPLIFIED WEIGHT CALCULATION
const calculateInteractionWeight = (character, interaction, worldState) => {
  let weight = 0;
  
  // 1. GOAL PRIORITY (Make this DOMINANT)
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
  
  // 2. CRITICAL NEEDS (Override everything except goals)
  const energyPercent = character.energy / character.maxEnergy;
  
  if (interaction.type === 'rest') {
    if (energyPercent < 0.2) weight += 8;  // Critical need
    else if (energyPercent < 0.5) weight += 3;  // Moderate need
    else weight += 0.5;  // Low priority when not needed
  }
  
  // 3. ENVIRONMENTAL SUITABILITY (Simple modifiers)
  const environment = worldState.nodes.find(n => n.id === character.currentNodeId)?.environment;
  if (environment) {
    if (interaction.type === 'rest' && environment.isDangerous()) {
      weight *= 0.1;  // Heavily discourage rest in danger
    }
    if (interaction.type === 'movement' && environment.isDangerous()) {
      weight += 2;  // Encourage leaving dangerous areas
    }
  }
  
  // 4. PERSONALITY INFLUENCE (Simplified)
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
  
  // 5. MEMORY (Simple positive/negative)
  const memoryService = new MemoryService();
  const memoryScore = memoryService.getMemoryInfluence(character, interaction);
  weight += memoryScore * 2;  // -2 to +2 based on past experience
  
  // 6. NEED-BASED MODIFIERS (From settlement need satisfaction)
  if (character.needBasedInteractionModifiers) {
    const interactionType = interaction.type || interaction.category || 'unknown';
    const modifier = character.needBasedInteractionModifiers[interactionType] || 1.0;
    weight *= modifier;
  }

  // 7. NEED-BASED PRIORITIES (From settlement need satisfaction)
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

  // 8. RANDOM VARIATION (Small, for variety)
  weight += Math.random() * 0.5;
  
  // Ensure non-negative
  return Math.max(0, weight);
};

// Helper function to gather available interactions
function gatherAvailableInteractions(character, worldState) {
  const currentNode = worldState.nodes.find(node => node.id === character.currentNodeId);
  if (!currentNode) {
    throw new Error('Character has no valid node');
  }

  const interactionManager = new InteractionManager();
  const availableInteractionsData = interactionManager.getAvailableInteractions({
    character,
    world: worldState,
    currentNode
  });

  // Filter available interactions based on character state
  const availableInteractions = availableInteractionsData.allInteractions.filter(interaction => {
    try {
      // System interactions use InteractionManager's validation
      if (interaction.isSystemInteraction) {
        return interactionManager.canExecuteInteraction(interaction, { character, worldState, currentNode });
      }
      
      // Content interactions use canExecute method
      const canExecuteResult = interaction.canExecute && interaction.canExecute(character, worldState);
      
      return canExecuteResult;
    } catch (error) {
      console.warn(`Error checking if interaction can execute:`, error.message);
      return false;
    }
  });

  return availableInteractions;
}

// Emergency handler (separate from main weighting)
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

// Biased selection (favors higher weights more strongly)
function selectWithBias(weightedOptions) {
  if (weightedOptions.length === 0) return null;
  
  // Normalize weights to prevent overflow with large values
  const maxWeight = Math.max(...weightedOptions.map(opt => opt.weight));
  const normalizedOptions = weightedOptions.map(opt => ({
    ...opt,
    normalizedWeight: opt.weight / maxWeight
  }));
  
  // Apply bias with normalized weights
  const biasedOptions = normalizedOptions.map(opt => ({
    ...opt,
    biasedWeight: Math.pow(opt.normalizedWeight, 1.5) // Softer bias than squared
  }));
  
  const totalWeight = biasedOptions.reduce((sum, opt) => sum + opt.biasedWeight, 0);
  
  if (totalWeight === 0) return null;
  
  let random = Math.random() * totalWeight;
  for (const opt of biasedOptions) {
    random -= opt.biasedWeight;
    if (random <= 0) return opt.interaction;
  }
  
  return biasedOptions[0].interaction;
}

const generateBehavior = (character, worldState) => {
  if (!(character instanceof Character)) {
    throw new Error('Invalid character');
  }
  
  // Get all available interactions
  const availableInteractions = gatherAvailableInteractions(character, worldState);
  
  if (!availableInteractions.length) return null;
  
  // CRITICAL OVERRIDE: Handle emergencies first
  const emergency = handleEmergency(character, availableInteractions, worldState);
  if (emergency) return executeInteraction(character, emergency, worldState);
  
  // GOAL-DRIVEN SELECTION
  const weights = availableInteractions.map(interaction => ({
    interaction,
    weight: calculateInteractionWeight(character, interaction, worldState)
  }));
  
  // Sort by weight and add debug logging
  weights.sort((a, b) => b.weight - a.weight);
  
  if (DEBUG_MODE) {
    console.log(`${character.name} interaction weights:`, 
      weights.slice(0, 5).map(w => `${w.interaction.name}: ${w.weight.toFixed(2)}`)
    );
  }
  
  // Use weighted random selection with bias toward top choices
  const selectedInteraction = selectWithBias(weights);
  if (!selectedInteraction) return null;

  // Act: Execute the selected interaction
  return executeInteraction(character, selectedInteraction, worldState);
};

// Helper function to execute an interaction
function executeInteraction(character, selectedInteraction, worldState) {
  const interactionResolver = new InteractionResolver();
  const evolutionService = new EvolutionService();
  const historyGenerator = new HistoryGenerator();

  // Act: Resolve the interaction
  const branch = selectedInteraction.selectBranch ? interactionResolver.selectBranch(character, selectedInteraction) : null;
  const resolution = branch ? interactionResolver.resolve(character, selectedInteraction, branch.id, worldState) : null;

  // Learn: Evolve and log history
  if (resolution) {
    evolutionService.evolveFromInteraction(character, selectedInteraction, resolution.outcome);

    historyGenerator.logEvent({
      timestamp: worldState.time,
      character,
      interaction: selectedInteraction,
      outcome: resolution.outcome,
      roll: resolution.roll,
      dc: resolution.dc,
    });
  }

  return {
    interaction: selectedInteraction,
    branchId: branch?.id,
    resolution,
  };
}

export default generateBehavior;