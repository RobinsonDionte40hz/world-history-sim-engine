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

  // Check for critical needs first
  const criticalInteraction = checkCriticalNeeds(character, availableInteractionsData.systemInteractions, worldState);
  if (criticalInteraction) {
    return executeInteraction(character, criticalInteraction, worldState);
  }

  // Filter available interactions based on character state
  const availableInteractions = availableInteractionsData.allInteractions.filter(interaction => {
    // System interactions use InteractionManager's validation
    if (interaction.isSystemInteraction) {
      return interactionManager.canExecuteInteraction(interaction, { character, worldState, currentNode });
    }
    
    // Content interactions use existing logic
    return interaction.isAvailable(worldState.time) && interaction.meetsRequirements(character);
  });

  if (!availableInteractions.length) return null;  // No actions possible

  // Decide: Select an interaction based on goals, memory, and resonance
  const memoryService = new MemoryService();
  const selectedInteraction = weightedSelect(availableInteractions, interaction => {
    const memoryInfluence = memoryService.getMemoryInfluence(character, interaction);
    const branch = interaction.selectBranch ? interaction.selectBranch(character) : null;
    const energyProxy = character.attributes.getEnergyProxy();
    const gammaFreq = character.consciousness.frequency || 40;  // 40 Hz gamma baseline
    const energyDiff = energyProxy - (branch?.requiredEnergy || energyProxy);
    const resonance = Math.exp(-Math.pow(energyDiff - gammaFreq, 2) / (2 * gammaFreq));
    const coherenceBonus = character.consciousness.coherence * 1.5;  // Higher coherence favors optimal
    const goalMatch = character.goals.some(goal => interaction.name.includes(goal.id)) ? 2 : 0;  // Prioritize goals
    
    // Boost system interactions slightly to ensure they're considered
    const systemBonus = interaction.isSystemInteraction ? 1 : 0;
    
    return resonance + coherenceBonus + memoryInfluence + goalMatch + systemBonus;
  });

  if (!selectedInteraction) return null;

  // Act: Execute the selected interaction
  return executeInteraction(character, selectedInteraction, worldState);
};

// Helper function to check for critical needs
function checkCriticalNeeds(character, systemInteractions, worldState) {
  // Low energy - prioritize rest
  if (character.energy < character.maxEnergy * 0.2) {
    const restInteraction = systemInteractions.find(i => i.name.toLowerCase().includes('rest'));
    if (restInteraction) {
      return restInteraction;
    }
  }

  // Dangerous environment - prioritize movement to safety
  const environment = worldState.getCurrentEnvironment?.();
  if (environment && environment.isDangerous && environment.isDangerous()) {
    const movementInteraction = systemInteractions.find(i => i.name.toLowerCase().includes('move'));
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
  for (const opt of options) {
    rand -= weightFn(opt);
    if (rand <= 0) return opt;
  }
  return options[options.length - 1];  // Fallback
}

export default generateBehavior;