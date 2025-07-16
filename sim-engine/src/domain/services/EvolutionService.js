// src/domain/services/EvolutionService.js

import Character from '../entities/Character.js';

class EvolutionService {
  // Evolve a character based on an interaction outcome
  evolveFromInteraction(character, interaction, outcome) {
    if (!(character instanceof Character)) {
      throw new Error('Invalid character');
    }

    const success = outcome === 'positive';
    const coherence = character.consciousness?.coherence || 0;
    const learningRate = this.calculateLearningRate(coherence, success);

    // Create evolved character data
    let evolvedData = character.toJSON();

    // Update attributes (D&D-style progression)
    const attrToImprove = this.selectAttributeToImprove(character, success);
    if (attrToImprove && evolvedData.attributes) {
      const current = evolvedData.attributes[attrToImprove] || { score: 10 };
      const newScore = Math.min(20, current.score + learningRate);
      evolvedData.attributes = {
        ...evolvedData.attributes,
        [attrToImprove]: {
          score: newScore,
          modifier: Math.floor((newScore - 10) / 2)
        }
      };
    }

    // Update skills
    evolvedData = this.updateSkillsData(evolvedData, learningRate, interaction.type);

    // Update relationships
    evolvedData = this.updateRelationshipsData(evolvedData, interaction, learningRate);

    // Update influence/prestige
    evolvedData = this.updateProgressionData(evolvedData, interaction, outcome, learningRate);

    // Return new Character instance with evolved data
    return Character.fromJSON(evolvedData);
  }

  // Calculate learning rate based on coherence and success (quantum-inspired)
  calculateLearningRate(coherence, success) {
    const baseRate = success ? 0.1 : 0.02;
    const coherenceFactor = 1 + (coherence * 0.5);
    const goldenBoost = 1.618;
    return baseRate * coherenceFactor * (success ? goldenBoost : 1);
  }

  // Select attribute to improve based on interaction type
  selectAttributeToImprove(character, success) {
    const mappings = {
      'dialogue': 'charisma',
      'action': 'strength',
      'trade': 'intelligence',
    };
    return success ?
      mappings[character.lastInteractionType] || 'wisdom' :
      null;
  }

  // Update skills in character data
  updateSkillsData(characterData, learningRate, interactionType) {
    const skillToImprove = interactionType === 'trade' ? 'bargaining' : 'combat';

    if (characterData.skills && characterData.skills[skillToImprove]) {
      return {
        ...characterData,
        skills: {
          ...characterData.skills,
          [skillToImprove]: {
            ...characterData.skills[skillToImprove],
            level: Math.min(20, (characterData.skills[skillToImprove].level || 0) + learningRate)
          }
        }
      };
    }

    return characterData;
  }

  // Update relationships in character data
  updateRelationshipsData(characterData, interaction, learningRate) {
    if (!interaction.participants || !Array.isArray(characterData.relationships)) {
      return characterData;
    }

    const relationshipsMap = new Map(characterData.relationships);

    interaction.participants.forEach(participantId => {
      if (participantId !== characterData.id) {
        const currentAffinity = relationshipsMap.get(participantId) || 0;
        const delta = interaction.type === 'dialogue' ? learningRate * 0.5 : -learningRate * 0.5;
        relationshipsMap.set(participantId, Math.max(-1, Math.min(1, currentAffinity + delta)));
      }
    });

    return {
      ...characterData,
      relationships: Array.from(relationshipsMap.entries())
    };
  }

  // Update influence/prestige in character data
  updateProgressionData(characterData, interaction, outcome, learningRate) {
    let updatedData = { ...characterData };

    if (interaction.effects?.some(e => e.type === 'influence') && characterData.influence) {
      updatedData.influence = {
        ...characterData.influence,
        value: (characterData.influence.value || 0) + learningRate * (outcome === 'positive' ? 2 : 1)
      };
    }

    if (interaction.effects?.some(e => e.type === 'prestige') && characterData.prestige) {
      updatedData.prestige = {
        ...characterData.prestige,
        value: (characterData.prestige.value || 0) + learningRate * (outcome === 'positive' ? 1.5 : 0.5)
      };
    }

    return updatedData;
  }

  // Evolve character over time (passive growth during ticks)
  evolveOverTime(character, ticksElapsed) {
    if (!(character instanceof Character)) {
      throw new Error('Invalid character - expected Character instance');
    }

    const passiveRate = 0.01 * (character.consciousness?.coherence || 0);
    const attrToImprove = this.selectAttributeToImprove(character, true);

    if (!attrToImprove || !passiveRate) {
      return character; // No evolution needed
    }

    // Get current character data
    const characterData = character.toJSON();

    if (characterData.attributes && characterData.attributes[attrToImprove]) {
      const current = characterData.attributes[attrToImprove];
      const newScore = Math.min(20, current.score + passiveRate * ticksElapsed);

      // Create updated character data
      const evolvedData = {
        ...characterData,
        attributes: {
          ...characterData.attributes,
          [attrToImprove]: {
            score: newScore,
            modifier: Math.floor((newScore - 10) / 2)
          }
        }
      };

      // Return new Character instance
      return Character.fromJSON(evolvedData);
    }

    return character; // Return unchanged if no attributes to improve
  }
}

export default EvolutionService;