/**
 * QuestTextTemplatingService - Service for quest text templating integration
 * 
 * Features:
 * - Templated quest objective creation
 * - Dynamic completion message generation
 * - Integration with existing quest system data structures
 * - Validation for quest-related template syntax
 * - Quest reward text generation
 * - Quest progression text templating
 */

import TextTemplateEngine from '../../domain/services/TextTemplateEngine';
import { QuestNode } from '../../domain/entities/Quest';

class QuestTextTemplatingService {
  constructor() {
    this.templateEngine = new TextTemplateEngine();
  }

  /**
   * Create templated quest objectives from encounter data
   * @param {object} encounter - Encounter with quest objectives
   * @param {object} context - Template context (character, node, world)
   * @returns {Array} Array of processed quest objectives
   */
  createTemplatedObjectives(encounter, context = {}) {
    if (!encounter.questObjectives || encounter.questObjectives.length === 0) {
      return [];
    }

    return encounter.questObjectives.map(objective => {
      const processedObjective = {
        ...objective,
        resolvedText: this.resolveObjectiveText(objective.text, context),
        templateContext: context
      };

      // Validate the objective text
      const validation = this.validateQuestTemplate(objective.text);
      if (!validation.isValid) {
        processedObjective.errors = validation.errors;
        processedObjective.warnings = validation.warnings;
      }

      return processedObjective;
    });
  }

  /**
   * Resolve quest objective text with context
   * @param {string} objectiveText - Template text for objective
   * @param {object} context - Template context
   * @returns {string} Resolved objective text
   */
  resolveObjectiveText(objectiveText, context) {
    if (!objectiveText) return '';

    try {
      const result = this.templateEngine.resolve(objectiveText, context);
      return result.resolved || objectiveText;
    } catch (error) {
      console.warn('Failed to resolve quest objective text:', error);
      return objectiveText;
    }
  }

  /**
   * Generate dynamic completion message
   * @param {string} completionTemplate - Template for completion message
   * @param {object} context - Template context
   * @param {object} questData - Quest completion data
   * @returns {object} Resolved completion message with metadata
   */
  generateCompletionMessage(completionTemplate, context, questData = {}) {
    if (!completionTemplate) {
      return {
        message: 'Quest completed.',
        resolved: true,
        errors: []
      };
    }

    // Enhance context with quest completion data
    const enhancedContext = {
      ...context,
      quest: {
        completed: true,
        objectivesCompleted: questData.objectivesCompleted || 0,
        totalObjectives: questData.totalObjectives || 1,
        completionTime: questData.completionTime || Date.now(),
        rewards: questData.rewards || [],
        ...questData
      }
    };

    try {
      const result = this.templateEngine.resolve(completionTemplate, enhancedContext);
      return {
        message: result.resolved || completionTemplate,
        resolved: result.errors.length === 0,
        errors: result.errors || [],
        warnings: result.warnings || [],
        context: enhancedContext
      };
    } catch (error) {
      return {
        message: completionTemplate,
        resolved: false,
        errors: [`Template resolution failed: ${error.message}`],
        warnings: [],
        context: enhancedContext
      };
    }
  }

  /**
   * Validate quest-related template syntax
   * @param {string} templateText - Template text to validate
   * @returns {object} Validation result
   */
  validateQuestTemplate(templateText) {
    if (!templateText) {
      return { isValid: true, errors: [], warnings: [] };
    }

    // Use base template validation
    const baseValidation = this.templateEngine.validateTemplate(templateText);
    
    // Add quest-specific validation
    const questValidation = this.validateQuestSpecificSyntax(templateText);
    
    return {
      isValid: baseValidation.isValid && questValidation.isValid,
      errors: [...(baseValidation.errors || []), ...(questValidation.errors || [])],
      warnings: [...(baseValidation.warnings || []), ...(questValidation.warnings || [])]
    };
  }

  /**
   * Validate quest-specific template syntax
   * @param {string} templateText - Template text to validate
   * @returns {object} Quest-specific validation result
   */
  validateQuestSpecificSyntax(templateText) {
    const errors = [];
    const warnings = [];

    // Check for quest-specific placeholders
    const questPlaceholders = this.extractQuestPlaceholders(templateText);
    
    questPlaceholders.forEach(placeholder => {
      // Validate quest objective references (including negative indices)
      if (placeholder.startsWith('quest.objective.')) {
        const objectiveMatch = placeholder.match(/quest\.objective\.(-?\d+)/);
        if (objectiveMatch) {
          const index = parseInt(objectiveMatch[1]);
          if (index < 0) {
            errors.push(`Invalid quest objective index: ${index}. Index must be non-negative.`);
          }
        }
      }

      // Validate quest reward references
      if (placeholder.startsWith('quest.reward.')) {
        const rewardType = placeholder.split('.')[2];
        const validRewardTypes = ['gold', 'experience', 'item', 'reputation', 'influence'];
        if (rewardType && !validRewardTypes.includes(rewardType)) {
          warnings.push(`Unknown quest reward type: ${rewardType}. Valid types: ${validRewardTypes.join(', ')}`);
        }
      }

      // Validate quest status references
      if (placeholder.startsWith('quest.status.')) {
        const statusType = placeholder.split('.')[2];
        const validStatusTypes = ['completed', 'failed', 'active', 'available'];
        if (statusType && !validStatusTypes.includes(statusType)) {
          warnings.push(`Unknown quest status type: ${statusType}. Valid types: ${validStatusTypes.join(', ')}`);
        }
      }
    });

    // Check for common quest template patterns
    if (templateText.includes('{{quest.')) {
      // Ensure quest context is being used properly
      if (!templateText.includes('{{#if quest.') && templateText.includes('quest.completed')) {
        warnings.push('Consider using conditional logic for quest completion states: {{#if quest.completed}}');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Extract quest-specific placeholders from template text
   * @param {string} templateText - Template text
   * @returns {Array} Array of quest placeholders
   */
  extractQuestPlaceholders(templateText) {
    const questPlaceholderRegex = /{{\s*(quest\.[^}]+)\s*}}/g;
    const placeholders = [];
    let match;

    while ((match = questPlaceholderRegex.exec(templateText)) !== null) {
      placeholders.push(match[1].trim());
    }

    return placeholders;
  }

  /**
   * Convert encounter quest objectives to QuestNode entities
   * @param {object} encounter - Encounter with quest objectives
   * @param {object} context - Template context
   * @returns {Array} Array of QuestNode entities
   */
  convertToQuestNodes(encounter, context = {}) {
    if (!encounter.questObjectives || encounter.questObjectives.length === 0) {
      return [];
    }

    return encounter.questObjectives.map((objective, index) => {
      const nodeConfig = {
        id: `${encounter.id}_objective_${index}`,
        name: `Objective ${index + 1}`,
        description: this.resolveObjectiveText(objective.text, context),
        type: 'action', // Default type for encounter objectives
        requirements: {
          encounterId: encounter.id,
          objectiveType: objective.type || 'primary'
        },
        consequences: {
          questProgress: {
            objectiveId: objective.id,
            completed: true
          }
        },
        branches: [],
        consciousnessTriggers: [],
        unlockConditions: []
      };

      // Add completion consequences based on objective type
      if (objective.type === 'primary') {
        nodeConfig.consequences.experience = 100;
      } else if (objective.type === 'secondary') {
        nodeConfig.consequences.experience = 50;
      } else if (objective.type === 'optional') {
        nodeConfig.consequences.experience = 25;
      }

      return new QuestNode(nodeConfig);
    });
  }

  /**
   * Generate quest reward text based on encounter rewards
   * @param {Array} rewards - Array of reward objects
   * @param {object} context - Template context
   * @returns {string} Generated reward text
   */
  generateRewardText(rewards = [], context = {}) {
    if (rewards.length === 0) {
      return 'You receive recognition for your efforts.';
    }

    const rewardTexts = rewards.map(reward => {
      switch (reward.type) {
        case 'experience':
          return `{{random:You gain,You earn,You receive}} ${reward.value} experience points.`;
        case 'gold':
          return `{{random:You find,You earn,You receive}} ${reward.value} {{random:gold pieces,coins,gold}}.`;
        case 'item':
          return `{{random:You obtain,You find,You receive}} {{random:a valuable item,a useful tool,equipment}}.`;
        case 'reputation':
          return `Your reputation {{random:increases,improves,grows}} by ${reward.value}.`;
        case 'influence':
          return `Your influence in {{node.name}} {{random:increases,grows,expands}}.`;
        default:
          return `You receive ${reward.description || 'a reward'}.`;
      }
    });

    // Combine multiple rewards
    if (rewardTexts.length === 1) {
      return this.templateEngine.resolve(rewardTexts[0], context).resolved;
    } else if (rewardTexts.length === 2) {
      const combined = `${rewardTexts[0]} Additionally, ${rewardTexts[1].toLowerCase()}`;
      return this.templateEngine.resolve(combined, context).resolved;
    } else {
      const lastReward = rewardTexts.pop();
      const combined = `${rewardTexts.join(', ')}, and ${lastReward.toLowerCase()}`;
      return this.templateEngine.resolve(combined, context).resolved;
    }
  }

  /**
   * Create quest progression text for different stages
   * @param {string} stage - Quest stage ('start', 'progress', 'complete', 'fail')
   * @param {object} questData - Quest data
   * @param {object} context - Template context
   * @returns {string} Generated progression text
   */
  generateProgressionText(stage, questData, context = {}) {
    const templates = {
      start: [
        'A new {{random:quest,mission,task}} begins: {{quest.name}}',
        '{{character.name}} accepts the {{random:challenge,quest,mission}}: {{quest.name}}',
        'The {{random:journey,adventure,quest}} starts: {{quest.name}}'
      ],
      progress: [
        '{{character.name}} makes progress on {{quest.name}}',
        'The {{random:quest,mission}} {{quest.name}} continues',
        '{{character.name}} {{random:advances,progresses,moves forward}} in {{quest.name}}'
      ],
      complete: [
        '{{character.name}} {{random:completes,finishes,accomplishes}} {{quest.name}}!',
        'The {{random:quest,mission}} {{quest.name}} is {{random:complete,finished,accomplished}}!',
        '{{random:Success,Victory,Achievement}}! {{quest.name}} has been completed.'
      ],
      fail: [
        '{{character.name}} {{random:fails,cannot complete,abandons}} {{quest.name}}',
        'The {{random:quest,mission}} {{quest.name}} {{random:fails,ends in failure,cannot be completed}}',
        '{{random:Failure,Defeat,Setback}}: {{quest.name}} remains incomplete'
      ]
    };

    const stageTemplates = templates[stage] || templates.progress;
    const selectedTemplate = stageTemplates[Math.floor(Math.random() * stageTemplates.length)];

    const enhancedContext = {
      ...context,
      quest: {
        name: questData.name || 'Unknown Quest',
        stage: stage,
        ...questData
      }
    };

    try {
      return this.templateEngine.resolve(selectedTemplate, enhancedContext).resolved;
    } catch (error) {
      return `Quest ${stage}: ${questData.name || 'Unknown Quest'}`;
    }
  }

  /**
   * Validate quest integration with encounter
   * @param {object} encounter - Encounter object
   * @returns {object} Validation result
   */
  validateQuestIntegration(encounter) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    if (!encounter) {
      validation.isValid = false;
      validation.errors.push('No encounter provided for quest integration validation');
      return validation;
    }

    // Check quest objectives
    if (encounter.questObjectives && encounter.questObjectives.length > 0) {
      encounter.questObjectives.forEach((objective, index) => {
        if (!objective.text || !objective.text.trim()) {
          validation.errors.push(`Quest objective ${index + 1} has empty text`);
          validation.isValid = false;
        } else {
          // Validate objective template syntax
          const objectiveValidation = this.validateQuestTemplate(objective.text);
          if (!objectiveValidation.isValid) {
            validation.errors.push(`Quest objective ${index + 1} has template errors: ${objectiveValidation.errors.join(', ')}`);
            validation.isValid = false;
          }
          validation.warnings.push(...objectiveValidation.warnings);
        }

        // Check objective type
        const validTypes = ['primary', 'secondary', 'optional', 'hidden'];
        if (objective.type && !validTypes.includes(objective.type)) {
          validation.warnings.push(`Quest objective ${index + 1} has unknown type: ${objective.type}`);
        }
      });

      // Suggest improvements
      if (encounter.questObjectives.length > 5) {
        validation.warnings.push('Consider reducing the number of quest objectives for better player experience');
      }

      const primaryObjectives = encounter.questObjectives.filter(obj => obj.type === 'primary');
      if (primaryObjectives.length === 0) {
        validation.suggestions.push('Consider adding at least one primary objective');
      }
    }

    // Check completion message
    if (encounter.completionMessage) {
      const completionValidation = this.validateQuestTemplate(encounter.completionMessage);
      if (!completionValidation.isValid) {
        validation.errors.push(`Completion message has template errors: ${completionValidation.errors.join(', ')}`);
        validation.isValid = false;
      }
      validation.warnings.push(...completionValidation.warnings);
    } else {
      validation.suggestions.push('Consider adding a completion message for better player feedback');
    }

    // Check quest rewards
    if (encounter.questRewards && encounter.questRewards.length > 0) {
      encounter.questRewards.forEach((reward, index) => {
        if (!reward.type) {
          validation.warnings.push(`Quest reward ${index + 1} has no type specified`);
        }
        if (reward.value !== undefined && (isNaN(reward.value) || reward.value < 0)) {
          validation.warnings.push(`Quest reward ${index + 1} has invalid value: ${reward.value}`);
        }
      });
    }

    return validation;
  }

  /**
   * Generate sample quest templates for testing
   * @param {string} encounterType - Type of encounter
   * @returns {object} Sample quest templates
   */
  generateSampleQuestTemplates(encounterType = 'combat') {
    const templates = {
      combat: {
        objectives: [
          {
            id: 'combat_obj_1',
            text: 'Defeat the {{random:bandits,enemies,foes}} threatening {{node.name}}',
            type: 'primary'
          },
          {
            id: 'combat_obj_2',
            text: 'Protect the {{random:civilians,townspeople,innocents}} during the battle',
            type: 'secondary'
          }
        ],
        completionMessage: '{{character.name}} has {{random:defeated,vanquished,overcome}} the threat to {{node.name}}! The {{random:people,citizens,residents}} are safe.',
        rewards: [
          { type: 'experience', value: 200 },
          { type: 'gold', value: 100 },
          { type: 'reputation', value: 5 }
        ]
      },
      social: {
        objectives: [
          {
            id: 'social_obj_1',
            text: 'Negotiate a {{random:peaceful resolution,compromise,agreement}} with {{participants.first.name}}',
            type: 'primary'
          },
          {
            id: 'social_obj_2',
            text: 'Maintain {{character.name}}\'s reputation during the {{random:negotiation,discussion,meeting}}',
            type: 'secondary'
          }
        ],
        completionMessage: 'Through {{random:skillful negotiation,diplomatic prowess,careful words}}, {{character.name}} has reached an understanding.',
        rewards: [
          { type: 'experience', value: 150 },
          { type: 'influence', value: 10 },
          { type: 'reputation', value: 3 }
        ]
      },
      exploration: {
        objectives: [
          {
            id: 'exploration_obj_1',
            text: 'Discover the {{random:secret,hidden truth,mystery}} of {{node.name}}',
            type: 'primary'
          },
          {
            id: 'exploration_obj_2',
            text: 'Document your {{random:findings,discoveries,observations}} for future reference',
            type: 'optional'
          }
        ],
        completionMessage: '{{character.name}} has uncovered {{random:valuable knowledge,important secrets,hidden truths}} about {{node.name}}.',
        rewards: [
          { type: 'experience', value: 175 },
          { type: 'item', description: 'Ancient Map' }
        ]
      }
    };

    return templates[encounterType] || templates.combat;
  }
}

export default QuestTextTemplatingService;