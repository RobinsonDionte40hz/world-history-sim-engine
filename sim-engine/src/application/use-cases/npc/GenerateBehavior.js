// src/application/use-cases/npc/GenerateBehavior.js

import Character from '../../../domain/entities/Character.js';
import Interaction from '../../../domain/entities/Interaction.js';
import InteractionResolver from '../../../domain/services/InteractionResolver.js';
import MemoryService from '../../../domain/services/MemoryService.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';

const generateBehavior = (character, worldState) => {
  if (!(character instanceof Character)) {
    throw new Error('Invalid character');
  }

  // Perceive: Find available interactions in current node
  const currentNode = worldState.nodes.find(node => node.id === character.currentNodeId);
  if (!currentNode) {
    throw new Error('Character has no valid node');
  }

  const availableInteractions = currentNode.interactions.filter(interaction =>
    interaction.isAvailable(worldState.time) && interaction.meetsRequirements(character)
  );
  if (!availableInteractions.length) return null;  // No actions possible

  // Decide: Select an interaction based on goals, memory, and resonance
  const memoryService = new MemoryService();
  const interactionResolver = new InteractionResolver();
  const selectedInteraction = weightedSelect(availableInteractions, interaction => {
    const memoryInfluence = memoryService.getMemoryInfluence(character, interaction);
    const branch = interaction.selectBranch(character);
    const energyProxy = character.attributes.getEnergyProxy();
    const gammaFreq = character.consciousness.frequency || 40;  // 40 Hz gamma baseline
    const energyDiff = energyProxy - (branch?.requiredEnergy || energyProxy);
    const resonance = Math.exp(-Math.pow(energyDiff - gammaFreq, 2) / (2 * gammaFreq));
    const coherenceBonus = character.consciousness.coherence * 1.5;  // Higher coherence favors optimal
    const goalMatch = character.goals.some(goal => interaction.name.includes(goal.id)) ? 2 : 0;  // Prioritize goals
    return resonance + coherenceBonus + memoryInfluence + goalMatch;
  });

  if (!selectedInteraction) return null;

  // Act: Resolve the interaction
  const branch = interactionResolver.selectBranch(character, selectedInteraction);
  const resolution = interactionResolver.resolve(character, selectedInteraction, branch.id);

  // Learn: Evolve and log history
  const evolutionService = new EvolutionService();
  evolutionService.evolveFromInteraction(character, selectedInteraction, resolution.outcome);

  const historyGenerator = new HistoryGenerator();
  historyGenerator.logEvent({
    timestamp: worldState.time,
    character,
    interaction: selectedInteraction,
    outcome: resolution.outcome,
    roll: resolution.roll,
    dc: resolution.dc,
  });

  return {
    interaction: selectedInteraction,
    branchId: branch.id,
    resolution,
  };
};

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