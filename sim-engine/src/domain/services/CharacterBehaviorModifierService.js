// src/domain/services/CharacterBehaviorModifierService.js

const BaseDomainService = require('./BaseDomainService.js');
const Character = require('../entities/Character.js');

/**
 * Domain service for modifying character behavior based on need satisfaction
 * Applies mood, energy, and health changes, and influences interaction selection
 * based on settlement need satisfaction levels.
 */
class CharacterBehaviorModifierService extends BaseDomainService {
  /**
   * Apply need satisfaction modifiers to character stats and behavior
   * @param {Character} character - The character to modify
   * @param {Object} settlement - The settlement with need satisfaction data
   * @param {Object} worldState - Current world state
   * @returns {Character} Modified character instance
   */
  applyNeedSatisfactionModifiers(character, settlement, worldState) {
    if (!character) {
      throw new Error('Character is required');
    }
    if (!settlement) {
      throw new Error('Settlement is required');
    }

    // Return unchanged character if no need satisfaction data
    if (!settlement.needSatisfaction?.current) {
      return character;
    }

    const needs = settlement.needSatisfaction.current;
    const consequences = settlement.needSatisfaction.activeConsequences || [];

    // Calculate stat modifiers
    const statModifiers = this._calculateStatModifiers(needs, consequences);

    // Calculate behavior changes
    const behaviorChanges = this._calculateBehaviorChanges(needs, consequences);

    // Calculate interaction modifiers
    const interactionModifiers = this._calculateInteractionModifiers(needs);

    // Apply modifiers to create new character instance
    const modifiedCharacterData = {
      ...character.toJSON(),
      energy: Math.max(0, Math.min(character.maxEnergy, character.energy + statModifiers.energy)),
      health: Math.max(0, Math.min(100, character.health + statModifiers.health)),
      mood: Math.max(0, Math.min(100, character.mood + statModifiers.mood)),
      needBasedBehaviorChanges: behaviorChanges,
      needBasedInteractionModifiers: interactionModifiers
    };

    return new Character(modifiedCharacterData);
  }

  /**
   * Get interaction modifiers based on character and settlement needs
   * @param {Character} character - The character
   * @param {Object} interaction - The interaction to modify
   * @param {Object} settlement - The settlement
   * @returns {Object} Modifier object with weightModifier, priorityModifier, etc.
   */
  getInteractionModifiers(character, interaction, settlement) {
    if (!character) {
      throw new Error('Character is required');
    }
    if (!settlement) {
      throw new Error('Settlement is required');
    }

    // Default modifiers
    const modifiers = {
      weightModifier: 1.0,
      priorityModifier: 1.0,
      successModifier: 1.0,
      durationModifier: 1.0
    };

    if (!settlement.needSatisfaction?.current) {
      return modifiers;
    }

    const needs = settlement.needSatisfaction.current;
    const interactionType = interaction.type || interaction.category || 'unknown';

    // Apply need-based modifiers
    if (needs.food < 0.3 && (interactionType.includes('farm') || interactionType.includes('hunt'))) {
      modifiers.weightModifier *= 2.0;
      modifiers.priorityModifier *= 1.5;
    }

    if (needs.water < 0.3 && interactionType.includes('water')) {
      modifiers.weightModifier *= 2.0;
      modifiers.priorityModifier *= 1.5;
    }

    if (needs.shelter < 0.3 && (interactionType.includes('build') || interactionType.includes('repair'))) {
      modifiers.weightModifier *= 1.8;
      modifiers.priorityModifier *= 1.4;
    }

    // Apply character state modifiers
    if (character.energy < character.maxEnergy * 0.3 && (interactionType.includes('build') || interactionType.includes('hunt'))) {
      modifiers.weightModifier *= 0.5;
      modifiers.successModifier *= 0.8;
    }

    return modifiers;
  }

  /**
   * Get need-based priorities for interaction types
   * @param {Character} character - The character
   * @param {Object} settlement - The settlement
   * @returns {Object} Priority map for interaction types
   */
  getNeedBasedPriorities(character, settlement) {
    if (!character) {
      throw new Error('Character is required');
    }
    if (!settlement) {
      throw new Error('Settlement is required');
    }

    const priorities = {};

    if (!settlement.needSatisfaction?.current) {
      return priorities;
    }

    const needs = settlement.needSatisfaction.current;

    // Food priorities
    if (needs.food < 0.5) {
      priorities.farming = Math.max(priorities.farming || 1.0, 2.0);
      priorities.hunting = Math.max(priorities.hunting || 1.0, 1.8);
      priorities.rest = Math.min(priorities.rest || 1.0, 0.7);
    }

    // Water priorities
    if (needs.water < 0.5) {
      priorities.water_collection = Math.max(priorities.water_collection || 1.0, 2.0);
      priorities.well_digging = Math.max(priorities.well_digging || 1.0, 1.8);
    }

    // Shelter priorities
    if (needs.shelter < 0.5) {
      priorities.building = Math.max(priorities.building || 1.0, 1.8);
      priorities.repair = Math.max(priorities.repair || 1.0, 1.6);
    }

    return priorities;
  }

  /**
   * Evaluate whether character should migrate based on settlement needs
   * @param {Character} character - The character
   * @param {Object} currentSettlement - Current settlement
   * @param {Array} availableSettlements - Available settlements to migrate to
   * @returns {Object} Migration decision with shouldMigrate, urgency, targetSettlement
   */
  evaluateMigrationDecision(character, currentSettlement, availableSettlements) {
    if (!character) {
      throw new Error('Character is required');
    }
    if (!currentSettlement) {
      throw new Error('Current settlement is required');
    }
    if (!Array.isArray(availableSettlements)) {
      availableSettlements = [];
    }

    const decision = {
      shouldMigrate: false,
      urgency: 0.0,
      targetSettlement: null
    };

    if (!currentSettlement.needSatisfaction?.current) {
      return decision;
    }

    const currentNeeds = currentSettlement.needSatisfaction.current;
    const consequences = currentSettlement.needSatisfaction.activeConsequences || [];

    // Calculate current settlement dissatisfaction
    const overallNeed = (currentNeeds.food + currentNeeds.water + currentNeeds.shelter + currentNeeds.goods + currentNeeds.services) / 5;
    const consequenceSeverity = consequences.reduce((sum, c) => sum + (c.severity || 0), 0);

    let dissatisfaction = (1 - overallNeed) + (consequenceSeverity * 0.2);

    // Apply personality modifiers
    if (character.personality?.traits) {
      const traits = character.personality.traits;
      const adventurousness = traits.get ? traits.get('adventurous')?.intensity || 0 : 0;
      const homebody = traits.get ? traits.get('homebody')?.intensity || 0 : 0;

      dissatisfaction *= (1 + adventurousness * 0.5 - homebody * 0.3);
    }

    // Find best alternative settlement
    let bestAlternative = null;
    let bestScore = -1;

    for (const settlement of availableSettlements) {
      if (!settlement.needSatisfaction?.current) continue;

      const altNeeds = settlement.needSatisfaction.current;
      const altOverall = (altNeeds.food + altNeeds.water + altNeeds.shelter + altNeeds.goods + altNeeds.services) / 5;
      const improvement = altOverall - overallNeed;

      if (improvement > 0.2) { // Only consider significant improvements
        const score = improvement * (settlement.population?.total || 100) / 100;
        if (score > bestScore) {
          bestScore = score;
          bestAlternative = settlement;
        }
      }
    }

    // Make migration decision
    decision.urgency = Math.min(1.0, dissatisfaction);
    decision.shouldMigrate = dissatisfaction > 0.6 && bestAlternative !== null;
    decision.targetSettlement = bestAlternative;

    return decision;
  }

  /**
   * Calculate stat modifiers based on needs and consequences
   * @private
   */
  _calculateStatModifiers(needs, consequences) {
    const modifiers = { energy: 0, health: 0, mood: 0 };

    // Food effects
    if (needs.food < 0.2) {
      modifiers.energy -= 15;
      modifiers.health -= 10;
      modifiers.mood -= 20;
    } else if (needs.food < 0.5) {
      modifiers.energy -= 5;
      modifiers.health -= 3;
      modifiers.mood -= 8;
    }

    // Water effects
    if (needs.water < 0.2) {
      modifiers.health -= 15;
      modifiers.energy -= 10;
      modifiers.mood -= 15;
    } else if (needs.water < 0.5) {
      modifiers.health -= 5;
      modifiers.energy -= 3;
      modifiers.mood -= 6;
    }

    // Shelter effects
    if (needs.shelter < 0.2) {
      modifiers.mood -= 25;
      modifiers.health -= 8;
    } else if (needs.shelter < 0.5) {
      modifiers.mood -= 10;
      modifiers.health -= 3;
    }

    // Consequence effects
    consequences.forEach(consequence => {
      const severity = consequence.severity || 0;
      switch (consequence.type) {
        case 'famine':
          modifiers.energy -= severity * 10;
          modifiers.health -= severity * 15;
          modifiers.mood -= severity * 20;
          break;
        case 'drought':
          modifiers.health -= severity * 12;
          modifiers.energy -= severity * 8;
          modifiers.mood -= severity * 15;
          break;
        case 'housing_crisis':
          modifiers.mood -= severity * 25;
          modifiers.health -= severity * 5;
          break;
        default:
          // No specific modifiers for unknown consequence types
          break;
      }
    });

    return modifiers;
  }

  /**
   * Calculate behavior changes based on needs
   * @private
   */
  _calculateBehaviorChanges(needs, consequences) {
    const changes = [];

    // Food-based changes
    if (needs.food < 0.3) {
      changes.push('seek_food', 'avoid_strenuous_activity');
    } else if (needs.food < 0.5) {
      changes.push('seek_food');
    }

    // Water-based changes
    if (needs.water < 0.3) {
      changes.push('seek_water', 'avoid_heat');
    } else if (needs.water < 0.5) {
      changes.push('seek_water');
    }

    // Shelter-based changes
    if (needs.shelter < 0.3) {
      changes.push('seek_shelter', 'avoid_weather');
    } else if (needs.shelter < 0.5) {
      changes.push('seek_shelter');
    }

    // Consequence-based changes
    consequences.forEach(consequence => {
      if (consequence.type === 'famine' && consequence.severity > 0.5) {
        changes.push('desperate_food_search', 'avoid_conflict');
      }
    });

    return changes;
  }

  /**
   * Calculate interaction modifiers based on needs
   * @private
   */
  _calculateInteractionModifiers(needs) {
    const modifiers = {};

    // Food-related interactions
    if (needs.food < 0.3) {
      modifiers.farm = 2.0;
      modifiers.hunt = 1.8;
    }

    // Water-related interactions
    if (needs.water < 0.3) {
      modifiers.water_collection = 2.0;
      modifiers.well_digging = 1.8;
    }

    // Shelter-related interactions
    if (needs.shelter < 0.3) {
      modifiers.build = 1.8;
      modifiers.repair = 1.6;
    }

    return modifiers;
  }
}

module.exports = CharacterBehaviorModifierService;
