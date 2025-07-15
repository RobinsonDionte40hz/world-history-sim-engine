// src/domain/services/PrerequisiteValidator.js

import { Alignment } from '../value-objects/Alignment.js';
import { Influence } from '../value-objects/Influence.js';
import { Prestige } from '../value-objects/Prestige.js';

/**
 * Enhanced PrerequisiteValidator service for validating prerequisites across
 * interactions, historical events, and character actions
 */
export class PrerequisiteValidator {
  /**
   * Validate prerequisites for an interaction (existing functionality enhanced)
   */
  static validatePrerequisites(interaction, character) {
    if (!interaction || !character) {
      return {
        isValid: false,
        errors: [{ field: 'input', message: 'Interaction and character are required', severity: 'error' }],
        warnings: []
      };
    }

    if (!interaction.prerequisites || !interaction.prerequisites.groups) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const groups = interaction.prerequisites.groups;
    if (groups.length === 0) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const errors = [];
    const warnings = [];

    // Check if any group is satisfied (OR logic between groups)
    let anyGroupValid = false;
    for (const group of groups) {
      const groupResult = this.validatePrerequisiteGroup(group, character);
      if (groupResult.isValid) {
        anyGroupValid = true;
        break;
      } else {
        errors.push(...groupResult.errors);
        warnings.push(...groupResult.warnings);
      }
    }

    if (!anyGroupValid) {
      return {
        isValid: false,
        errors,
        warnings: [...warnings, interaction.prerequisites.unavailableMessage || 'Prerequisites not met']
      };
    }

    return { isValid: true, errors: [], warnings };
  }

  /**
   * Validate a prerequisite group (enhanced with new value objects)
   */
  static validatePrerequisiteGroup(group, character) {
    if (!group.conditions || group.conditions.length === 0) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const errors = [];
    const warnings = [];

    // All conditions in a group must be satisfied (AND logic)
    for (const condition of group.conditions) {
      const conditionResult = this.validateCondition(condition, character);
      if (!conditionResult.isValid) {
        errors.push(...conditionResult.errors);
      }
      warnings.push(...conditionResult.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a single condition (enhanced with new value objects)
   */
  static validateCondition(condition, character) {
    try {
      switch (condition.type) {
        case 'level':
          return this.validateLevelCondition(condition, character);
        case 'skill':
          return this.validateSkillCondition(condition, character);
        case 'quest':
          return this.validateQuestCondition(condition, character);
        case 'item':
          return this.validateItemCondition(condition, character);
        case 'influence':
          return this.validateInfluenceCondition(condition, character);
        case 'prestige':
          return this.validatePrestigeCondition(condition, character);
        case 'alignment':
          return this.validateAlignmentCondition(condition, character);
        case 'personality':
          return this.validatePersonalityCondition(condition, character);
        case 'racial':
          return this.validateRacialCondition(condition, character);
        default:
          return {
            isValid: false,
            errors: [{ field: 'condition.type', message: `Unknown condition type: ${condition.type}`, severity: 'error' }],
            warnings: []
          };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [{ field: 'condition', message: `Validation error: ${error.message}`, severity: 'error' }],
        warnings: []
      };
    }
  }

  /**
   * NEW: Validate prerequisites for a historical event
   */
  static validateHistoricalEvent(event, worldState) {
    if (!event || !worldState) {
      return {
        isValid: false,
        errors: [{ field: 'input', message: 'Event and world state are required', severity: 'error' }],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Check if event can occur in current world state
    if (!event.canOccur(worldState)) {
      errors.push({
        field: 'worldState',
        message: `Event '${event.name}' cannot occur in current world state`,
        severity: 'error'
      });
    }

    // Validate world state requirements
    for (const requirement of event.worldStateRequirements || []) {
      const requirementResult = this.validateWorldStateRequirement(requirement, worldState);
      if (!requirementResult.isValid) {
        errors.push(...requirementResult.errors);
      }
      warnings.push(...requirementResult.warnings);
    }

    // Validate event prerequisites
    for (const prerequisite of event.prerequisites || []) {
      const prereqResult = this.validateEventPrerequisite(prerequisite, worldState);
      if (!prereqResult.isValid) {
        errors.push(...prereqResult.errors);
      }
      warnings.push(...prereqResult.warnings);
    }

    // Check temporal constraints
    const temporalResult = this.validateTemporalConstraints(event, worldState);
    if (!temporalResult.isValid) {
      errors.push(...temporalResult.errors);
    }
    warnings.push(...temporalResult.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * NEW: Validate prerequisites for a character action
   */
  static validateCharacterAction(action, character, context) {
    if (!action || !character) {
      return {
        isValid: false,
        errors: [{ field: 'input', message: 'Action and character are required', severity: 'error' }],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Validate character state for action
    const characterStateResult = this.validateCharacterStateForAction(action, character);
    if (!characterStateResult.isValid) {
      errors.push(...characterStateResult.errors);
    }
    warnings.push(...characterStateResult.warnings);

    // Validate action context if provided
    if (context) {
      const contextResult = this.validateActionContext(action, context);
      if (!contextResult.isValid) {
        errors.push(...contextResult.errors);
      }
      warnings.push(...contextResult.warnings);
    }

    // Validate action prerequisites
    if (action.prerequisites) {
      for (const prerequisite of action.prerequisites) {
        const prereqResult = this.validateActionPrerequisite(prerequisite, character, context);
        if (!prereqResult.isValid) {
          errors.push(...prereqResult.errors);
        }
        warnings.push(...prereqResult.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Enhanced condition validation methods with new value objects

  static validateLevelCondition(condition, character) {
    const playerLevel = character.level || 0;
    const requiredLevel = condition.value || 0;
    
    return {
      isValid: playerLevel >= requiredLevel,
      errors: playerLevel >= requiredLevel ? [] : [{
        field: 'level',
        message: `Requires level ${requiredLevel}, current level is ${playerLevel}`,
        severity: 'error'
      }],
      warnings: []
    };
  }

  static validateSkillCondition(condition, character) {
    const playerSkills = character.skills || {};
    const skillLevel = playerSkills[condition.skillId] || 0;
    const requiredLevel = condition.value || 0;
    
    return {
      isValid: skillLevel >= requiredLevel,
      errors: skillLevel >= requiredLevel ? [] : [{
        field: 'skill',
        message: `Requires ${condition.skillId} level ${requiredLevel}, current level is ${skillLevel}`,
        severity: 'error'
      }],
      warnings: []
    };
  }

  static validateQuestCondition(condition, character) {
    const completedQuests = character.completedQuests || [];
    const isCompleted = completedQuests.includes(condition.questId);
    
    return {
      isValid: isCompleted,
      errors: isCompleted ? [] : [{
        field: 'quest',
        message: `Requires completed quest: ${condition.questId}`,
        severity: 'error'
      }],
      warnings: []
    };
  }

  static validateItemCondition(condition, character) {
    const inventory = character.inventory || {};
    const itemCount = inventory[condition.itemId] || 0;
    const requiredCount = condition.value || 0;
    
    return {
      isValid: itemCount >= requiredCount,
      errors: itemCount >= requiredCount ? [] : [{
        field: 'item',
        message: `Requires ${requiredCount} ${condition.itemId}, current count is ${itemCount}`,
        severity: 'error'
      }],
      warnings: []
    };
  }

  static validateInfluenceCondition(condition, character) {
    // Handle both old and new influence systems
    let influenceValue = 0;
    
    if (character.influence instanceof Influence) {
      // New value object system
      try {
        influenceValue = character.influence.getValue(condition.domainId);
      } catch (error) {
        return {
          isValid: false,
          errors: [{
            field: 'influence',
            message: `Unknown influence domain: ${condition.domainId}`,
            severity: 'error'
          }],
          warnings: []
        };
      }
    } else if (character.influence && typeof character.influence === 'object') {
      // Legacy system compatibility
      const influence = character.influence.playerInfluence || character.influence;
      influenceValue = influence[condition.domainId] || 0;
    }
    
    const requiredInfluence = condition.value || 0;
    
    return {
      isValid: influenceValue >= requiredInfluence,
      errors: influenceValue >= requiredInfluence ? [] : [{
        field: 'influence',
        message: `Requires ${requiredInfluence} influence in ${condition.domainId}, current is ${influenceValue}`,
        severity: 'error'
      }],
      warnings: []
    };
  }

  static validatePrestigeCondition(condition, character) {
    // Handle both old and new prestige systems
    let prestigeValue = 0;
    
    if (character.prestige instanceof Prestige) {
      // New value object system
      try {
        prestigeValue = character.prestige.getValue(condition.trackId);
      } catch (error) {
        return {
          isValid: false,
          errors: [{
            field: 'prestige',
            message: `Unknown prestige track: ${condition.trackId}`,
            severity: 'error'
          }],
          warnings: []
        };
      }
    } else if (character.prestige && typeof character.prestige === 'object') {
      // Legacy system compatibility
      const prestige = character.prestige.playerPrestige || character.prestige;
      prestigeValue = prestige[condition.trackId] || 0;
    }
    
    const requiredPrestige = condition.value || 0;
    
    return {
      isValid: prestigeValue >= requiredPrestige,
      errors: prestigeValue >= requiredPrestige ? [] : [{
        field: 'prestige',
        message: `Requires ${requiredPrestige} prestige in ${condition.trackId}, current is ${prestigeValue}`,
        severity: 'error'
      }],
      warnings: []
    };
  }

  static validateAlignmentCondition(condition, character) {
    // Handle both old and new alignment systems
    let alignmentValue = 0;
    
    if (character.alignment instanceof Alignment) {
      // New value object system
      try {
        alignmentValue = character.alignment.getValue(condition.axisId);
      } catch (error) {
        return {
          isValid: false,
          errors: [{
            field: 'alignment',
            message: `Unknown alignment axis: ${condition.axisId}`,
            severity: 'error'
          }],
          warnings: []
        };
      }
    } else if (character.alignment && typeof character.alignment === 'object') {
      // Legacy system compatibility
      const alignment = character.alignment.playerAlignment || character.alignment;
      alignmentValue = alignment[condition.axisId] || 0;
    }
    
    const requiredAlignment = condition.value || 0;
    const operator = condition.operator || '>=';
    
    let isValid = false;
    switch (operator) {
      case '>=':
        isValid = alignmentValue >= requiredAlignment;
        break;
      case '<=':
        isValid = alignmentValue <= requiredAlignment;
        break;
      case '==':
        isValid = alignmentValue === requiredAlignment;
        break;
      case '>':
        isValid = alignmentValue > requiredAlignment;
        break;
      case '<':
        isValid = alignmentValue < requiredAlignment;
        break;
      default:
        isValid = alignmentValue >= requiredAlignment;
    }
    
    return {
      isValid,
      errors: isValid ? [] : [{
        field: 'alignment',
        message: `Requires alignment ${condition.axisId} ${operator} ${requiredAlignment}, current is ${alignmentValue}`,
        severity: 'error'
      }],
      warnings: []
    };
  }

  static validatePersonalityCondition(condition, character) {
    if (!character.personality) {
      return {
        isValid: false,
        errors: [{
          field: 'personality',
          message: 'Character has no personality data',
          severity: 'error'
        }],
        warnings: []
      };
    }

    let traitValue = 0;
    
    // Handle both old and new personality systems
    if (typeof character.personality.getTrait === 'function') {
      // New PersonalityProfile system
      const trait = character.personality.getTrait(condition.traitId);
      traitValue = trait ? trait.intensity : 0;
    } else if (character.personality.traits) {
      // Legacy system
      const trait = character.personality.traits.find(t => t.id === condition.traitId);
      traitValue = trait ? trait.intensity : 0;
    }
    
    const requiredValue = condition.value || 0;
    const operator = condition.operator || '>=';
    
    let isValid = false;
    switch (operator) {
      case '>=':
        isValid = traitValue >= requiredValue;
        break;
      case '<=':
        isValid = traitValue <= requiredValue;
        break;
      case '==':
        isValid = traitValue === requiredValue;
        break;
      case '>':
        isValid = traitValue > requiredValue;
        break;
      case '<':
        isValid = traitValue < requiredValue;
        break;
      default:
        isValid = traitValue >= requiredValue;
    }
    
    return {
      isValid,
      errors: isValid ? [] : [{
        field: 'personality',
        message: `Requires personality trait ${condition.traitId} ${operator} ${requiredValue}, current is ${traitValue}`,
        severity: 'error'
      }],
      warnings: []
    };
  }

  static validateRacialCondition(condition, character) {
    if (!character.race) {
      return {
        isValid: false,
        errors: [{
          field: 'race',
          message: 'Character has no racial data',
          severity: 'error'
        }],
        warnings: []
      };
    }

    // Handle both old and new racial systems
    let raceId = '';
    let subraceId = '';
    
    if (typeof character.race.getAttributeModifiers === 'function') {
      // New RacialTraits system
      raceId = character.race.race?.id || '';
      subraceId = character.race.subrace?.name || '';
    } else if (character.race.raceId) {
      // Legacy system
      raceId = character.race.raceId;
      subraceId = character.race.subraceId || '';
    }
    
    // Check race requirement
    if (condition.raceId && raceId !== condition.raceId) {
      return {
        isValid: false,
        errors: [{
          field: 'race',
          message: `Requires race ${condition.raceId}, character is ${raceId}`,
          severity: 'error'
        }],
        warnings: []
      };
    }
    
    // Check subrace requirement
    if (condition.subraceId && subraceId !== condition.subraceId) {
      return {
        isValid: false,
        errors: [{
          field: 'subrace',
          message: `Requires subrace ${condition.subraceId}, character is ${subraceId}`,
          severity: 'error'
        }],
        warnings: []
      };
    }
    
    return { isValid: true, errors: [], warnings: [] };
  }

  // Helper methods for new validation types

  static validateWorldStateRequirement(requirement, worldState) {
    const errors = [];
    const warnings = [];

    switch (requirement.type) {
      case 'population':
        const totalPopulation = worldState.settlements.reduce((sum, s) => sum + s.population, 0);
        if (totalPopulation < (requirement.minPopulation || 0)) {
          errors.push({
            field: 'population',
            message: `Requires minimum population of ${requirement.minPopulation}, current is ${totalPopulation}`,
            severity: 'error'
          });
        }
        break;
        
      case 'settlement_count':
        const settlementCount = worldState.settlements.length;
        if (settlementCount < (requirement.minCount || 0)) {
          errors.push({
            field: 'settlements',
            message: `Requires minimum ${requirement.minCount} settlements, current is ${settlementCount}`,
            severity: 'error'
          });
        }
        break;
        
      case 'global_condition':
        const conditionValue = worldState.globalConditions.get(requirement.condition) || 0;
        if (conditionValue < (requirement.minValue || 0)) {
          errors.push({
            field: 'globalCondition',
            message: `Requires ${requirement.condition} >= ${requirement.minValue}, current is ${conditionValue}`,
            severity: 'error'
          });
        }
        break;
        
      default:
        warnings.push(`Unknown world state requirement type: ${requirement.type}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateEventPrerequisite(prerequisite, worldState) {
    // Basic event prerequisite validation
    // This can be extended based on specific event types
    return { isValid: true, errors: [], warnings: [] };
  }

  static validateTemporalConstraints(event, worldState) {
    const errors = [];
    const warnings = [];
    
    const currentTime = worldState.currentTime || new Date();
    
    // Check if event is still active
    if (!event.isActive) {
      errors.push({
        field: 'temporal',
        message: 'Event is no longer active',
        severity: 'error'
      });
    }
    
    // Check duration constraints
    if (event.duration > 0) {
      const eventEndTime = new Date(event.timestamp.getTime() + event.duration);
      if (currentTime > eventEndTime) {
        errors.push({
          field: 'temporal',
          message: 'Event duration has expired',
          severity: 'error'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateCharacterStateForAction(action, character) {
    const errors = [];
    const warnings = [];
    
    // Basic character state validation
    if (!character.id) {
      errors.push({
        field: 'character',
        message: 'Character must have a valid ID',
        severity: 'error'
      });
    }
    
    // Check if character is in valid state for action
    if (character.status === 'inactive' || character.status === 'dead') {
      errors.push({
        field: 'character.status',
        message: `Character cannot perform actions while ${character.status}`,
        severity: 'error'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateActionContext(action, context) {
    const errors = [];
    const warnings = [];
    
    // Validate action context
    if (!context.location) {
      warnings.push('Action has no specified location');
    }
    
    if (context.participants && context.participants.length === 0 && action.requiresParticipants) {
      errors.push({
        field: 'context.participants',
        message: 'Action requires other participants',
        severity: 'error'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateActionPrerequisite(prerequisite, character, context) {
    // Validate action-specific prerequisites
    // This can be extended based on specific action types
    return { isValid: true, errors: [], warnings: [] };
  }
}