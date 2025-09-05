// src/application/use-cases/npc/GenerateBehavior.js

import Character from '../../../domain/entities/Character.js';
// import Interaction from '../../../domain/entities/Interaction.js'; // Currently unused
import InteractionResolver from '../../../domain/services/InteractionResolver.js';
import MemoryService from '../../../domain/services/MemoryService.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';
import InteractionManager from '../../../domain/services/InteractionManager.js';

const generateBehavior = (character, worldState) => {
  if (!(character instanceof Character)) {
    throw new Error('Invalid character');
  }

  // Perceive: Find available interactions using InteractionManager
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

  // Debug: Log all available interactions before filtering
  if (character.goals.some(g => g.id === 'socialize')) {
    console.log('Available interactions before filtering:');
    availableInteractionsData.allInteractions.forEach(interaction => {
      console.log(`- ${interaction.name} (type: ${interaction.type}, category: ${interaction.category})`);
    });
  }

  // Check for critical needs first
  const criticalInteraction = checkCriticalNeeds(character, availableInteractionsData.systemInteractions, worldState);
  if (criticalInteraction) {
    return executeInteraction(character, criticalInteraction, worldState);
  }

  // Filter available interactions based on character state
  const availableInteractions = availableInteractionsData.allInteractions.filter(interaction => {
    try {
      // System interactions use InteractionManager's validation
      if (interaction.isSystemInteraction) {
        return interactionManager.canExecuteInteraction(interaction, { character, worldState, currentNode });
      }
      
      // Content interactions use canExecute method
      const canExecuteResult = interaction.canExecute && interaction.canExecute(character, worldState);
      
      // Debug logging for social goal
      if (character.goals.some(g => g.id === 'socialize')) {
        console.log(`Filtering ${interaction.name}: canExecute=${canExecuteResult}, hasMethod=${!!interaction.canExecute}`);
      }
      
      return canExecuteResult;
    } catch (error) {
      console.warn(`Error checking if interaction can execute:`, error.message);
      return false;
    }
  });

  // Debug: Log interactions after filtering
  if (character.goals.some(g => g.id === 'socialize')) {
    console.log('Available interactions after filtering:');
    availableInteractions.forEach(interaction => {
      console.log(`- ${interaction.name} (type: ${interaction.type}, category: ${interaction.category})`);
    });
  }

  if (!availableInteractions.length) return null;  // No actions possible

  // Debug: Log interactions right before weightedSelect
  if (character.goals.some(g => g.id === 'socialize')) {
    console.log('Available interactions before weightedSelect:');
    availableInteractions.forEach((interaction, index) => {
      console.log(`${index}: ${interaction.name} (type: ${interaction.type}, category: ${interaction.category}, isSystem: ${interaction.isSystemInteraction})`);
    });
  }

  // Decide: Select an interaction based on goals, memory, and resonance
  const memoryService = new MemoryService();
  const selectedInteraction = weightedSelect(availableInteractions, interaction => {
    const memoryInfluence = memoryService.getMemoryInfluence(character, interaction);
    const branch = interaction.selectBranch ? interaction.selectBranch(character) : null;
    const energyLevel = character.energy || 50; // Use direct energy level
    const gammaFreq = character.consciousness.frequency || 40;  // 40 Hz gamma baseline
    const energyDiff = energyLevel - (branch?.requiredEnergy || energyLevel);
    const resonance = Math.exp(-Math.pow(energyDiff - gammaFreq, 2) / (2 * gammaFreq));
    const coherenceBonus = character.consciousness.coherence * 1.5;  // Higher coherence favors optimal
    
    // Goal matching with massive priority for content interactions
    const goalMatch = character.goals.some(goal => {
      // Check if interaction name, category, or tags match the goal
      const goalId = goal.id.toLowerCase();
      const interactionName = interaction.name.toLowerCase();
      const interactionCategory = interaction.category?.toLowerCase() || '';
      const interactionTags = interaction.tags || [];
      
      // Exact word matching for better precision
      const goalWords = goalId.split(/[-_\s]/).filter(word => word.length > 2); // Filter out short words
      const categoryWords = interactionCategory.split(/[-_\s]/).filter(word => word.length > 2);
      const nameWords = interactionName.split(/[-_\s]/).filter(word => word.length > 2);
      
      // Check for exact word matches or partial matches
      return goalWords.some(gWord => 
        categoryWords.some(cWord => cWord.includes(gWord) || gWord.includes(cWord)) ||
        nameWords.some(nWord => nWord.includes(gWord) || gWord.includes(nWord)) ||
        interactionTags.some(tag => tag.toLowerCase().includes(gWord) || gWord.includes(tag.toLowerCase()))
      );
    });
    
    // Debug logging
    if (character.goals.some(g => g.id === 'socialize')) {
      console.log(`Interaction: ${interaction.name}, Type: ${interaction.type}, Category: ${interaction.category}, GoalMatch: ${goalMatch}, IsSystem: ${interaction.isSystemInteraction}`);
    }
    
    // Massive bonus for content interactions that match goals
    const contentGoalBonus = (goalMatch && !interaction.isSystemInteraction) ? 10 : 0;
    
    // System interactions only get small bonus when NO content matches goals
    const hasContentGoalMatch = availableInteractions.some(i => 
      !i.isSystemInteraction && character.goals.some(goal => {
        const goalId = goal.id.toLowerCase();
        const interactionCategory = i.category?.toLowerCase() || '';
        const interactionTags = i.tags || [];
        return interactionCategory.includes(goalId.split(/[-_\s]/)[0]) || 
               interactionTags.some(tag => tag.toLowerCase().includes(goalId.split(/[-_\s]/)[0]));
      })
    );
    
    const systemBonus = (interaction.isSystemInteraction && !hasContentGoalMatch) ? 1 : 0;
    
    const totalWeight = resonance + coherenceBonus + memoryInfluence + contentGoalBonus + systemBonus;
    
  // Debug logging for social goal
  if (character.goals.some(g => g.id === 'socialize')) {
    console.log(`Weight calc - ${interaction.name}: resonance=${resonance.toFixed(2)}, coherence=${coherenceBonus.toFixed(2)}, memory=${memoryInfluence.toFixed(2)}, contentBonus=${contentGoalBonus}, systemBonus=${systemBonus}, TOTAL=${totalWeight.toFixed(2)}`);
  }
  
  return totalWeight;
});

  // Debug: Log the selected interaction
  if (character.goals.some(g => g.id === 'socialize')) {
    console.log(`Selected interaction: ${selectedInteraction.name} (type: ${selectedInteraction.type})`);
  }  if (!selectedInteraction) return null;

  // Act: Execute the selected interaction
  return executeInteraction(character, selectedInteraction, worldState);
};

// Helper function to check for critical needs
function checkCriticalNeeds(character, systemInteractions, worldState) {
  // Low energy - prioritize rest
  if (character.energy < character.maxEnergy * 0.2) {
    const restInteraction = systemInteractions.find(i => 
      i.constructor.name === 'RestInteraction' || 
      i.name.toLowerCase().includes('rest')
    );
    if (restInteraction) {
      return restInteraction;
    }
  }

  // Dangerous environment - prioritize movement to safety
  const environment = worldState.getCurrentEnvironment?.();
  if (environment && environment.isDangerous && environment.isDangerous()) {
    const movementInteraction = systemInteractions.find(i => 
      i.constructor.name === 'MovementInteraction' || 
      i.name.toLowerCase().includes('move')
    );
    if (movementInteraction) {
      return movementInteraction;
    }
  }

  return null;
}

// Helper function to execute an interaction
function executeInteraction(character, selectedInteraction, worldState) {
  const interactionResolver = new InteractionResolver();
  const evolutionService = new EvolutionService();
  const historyGenerator = new HistoryGenerator();

  // Act: Resolve the interaction
  const branch = selectedInteraction.selectBranch ? interactionResolver.selectBranch(character, selectedInteraction) : null;
  const resolution = branch ? interactionResolver.resolve(character, selectedInteraction, branch.id) : null;

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

// Helper function (move to shared/utils/weightedSelect.js if not existing)
function weightedSelect(options, weightFn) {
  const totalWeight = options.reduce((sum, opt) => sum + weightFn(opt), 0);
  let rand = Math.random() * totalWeight;
  
  // Debug logging for weighted selection
  console.log(`WeightedSelect: totalWeight=${totalWeight.toFixed(2)}, rand=${rand.toFixed(2)}`);
  
  for (const opt of options) {
    const weight = weightFn(opt);
    rand -= weight;
    console.log(`Checking ${opt.name}: weight=${weight.toFixed(2)}, remaining rand=${rand.toFixed(2)}`);
    if (rand <= 0) {
      console.log(`Selected: ${opt.name}`);
      return opt;
    }
  }
  console.log(`Fallback selected: ${options[options.length - 1].name}`);
  return options[options.length - 1];  // Fallback
}

export default generateBehavior;