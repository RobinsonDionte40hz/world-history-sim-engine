/**
 * QuestTextTemplatingService Tests
 */

import QuestTextTemplatingService from '../QuestTextTemplatingService';

describe('QuestTextTemplatingService', () => {
  let service;
  let mockContext;

  beforeEach(() => {
    service = new QuestTextTemplatingService();
    mockContext = {
      character: {
        name: 'Aria Blackwood',
        attributes: {
          strength: 16,
          charisma: 18
        }
      },
      node: {
        name: 'Royal Court',
        type: 'palace'
      },
      world: {
        name: 'Eldoria'
      }
    };
  });

  describe('createTemplatedObjectives', () => {
    it('should process quest objectives with template resolution', () => {
      const encounter = {
        id: 'test_encounter',
        questObjectives: [
          {
            id: 'obj1',
            text: 'Speak with {{character.name}} at {{node.name}}',
            type: 'primary'
          },
          {
            id: 'obj2',
            text: 'Gain the trust of the {{node.type}} inhabitants',
            type: 'secondary'
          }
        ]
      };

      const result = service.createTemplatedObjectives(encounter, mockContext);

      expect(result).toHaveLength(2);
      expect(result[0].resolvedText).toBe('Speak with Aria Blackwood at Royal Court');
      expect(result[1].resolvedText).toBe('Gain the trust of the palace inhabitants');
    });

    it('should handle empty quest objectives', () => {
      const encounter = { id: 'test_encounter' };
      const result = service.createTemplatedObjectives(encounter, mockContext);
      expect(result).toEqual([]);
    });
  });

  describe('generateCompletionMessage', () => {
    it('should generate completion message with quest context', () => {
      const template = '{{character.name}} has completed the quest at {{node.name}}!';
      const questData = {
        objectivesCompleted: 2,
        totalObjectives: 2
      };

      const result = service.generateCompletionMessage(template, mockContext, questData);

      expect(result.message).toBe('Aria Blackwood has completed the quest at Royal Court!');
      expect(result.resolved).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should provide default message when template is empty', () => {
      const result = service.generateCompletionMessage('', mockContext);
      expect(result.message).toBe('Quest completed.');
      expect(result.resolved).toBe(true);
    });
  });

  describe('validateQuestTemplate', () => {
    it('should validate valid quest template', () => {
      const template = 'Complete the task at {{node.name}}';
      const result = service.validateQuestTemplate(template);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid quest objective index', () => {
      const template = 'Complete {{quest.objective.-1}}';
      const result = service.validateQuestTemplate(template);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid quest objective index: -1. Index must be non-negative.');
    });

    it('should warn about unknown reward types', () => {
      const template = 'Receive {{quest.reward.unknown_type}}';
      const result = service.validateQuestTemplate(template);
      
      expect(result.warnings).toContain('Unknown quest reward type: unknown_type. Valid types: gold, experience, item, reputation, influence');
    });
  });

  describe('validateQuestIntegration', () => {
    it('should validate encounter with valid quest integration', () => {
      const encounter = {
        id: 'test_encounter',
        questObjectives: [
          {
            id: 'obj1',
            text: 'Complete the task',
            type: 'primary'
          }
        ],
        completionMessage: 'Quest completed!'
      };

      const result = service.validateQuestIntegration(encounter);
      expect(result.isValid).toBe(true);
    });

    it('should detect empty objective text', () => {
      const encounter = {
        id: 'test_encounter',
        questObjectives: [
          {
            id: 'obj1',
            text: '',
            type: 'primary'
          }
        ]
      };

      const result = service.validateQuestIntegration(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Quest objective 1 has empty text');
    });

    it('should suggest adding primary objective when none exist', () => {
      const encounter = {
        id: 'test_encounter',
        questObjectives: [
          {
            id: 'obj1',
            text: 'Optional task',
            type: 'optional'
          }
        ]
      };

      const result = service.validateQuestIntegration(encounter);
      expect(result.suggestions).toContain('Consider adding at least one primary objective');
    });
  });

  describe('generateSampleQuestTemplates', () => {
    it('should generate combat quest template', () => {
      const result = service.generateSampleQuestTemplates('combat');
      
      expect(result.objectives).toHaveLength(2);
      expect(result.objectives[0].type).toBe('primary');
      expect(result.objectives[1].type).toBe('secondary');
      expect(result.completionMessage).toContain('{{character.name}}');
      expect(result.rewards).toContainEqual(
        expect.objectContaining({ type: 'experience', value: 200 })
      );
    });

    it('should generate social quest template', () => {
      const result = service.generateSampleQuestTemplates('social');
      
      expect(result.objectives[0].text).toContain('Negotiate');
      expect(result.rewards).toContainEqual(
        expect.objectContaining({ type: 'influence', value: 10 })
      );
    });

    it('should default to combat template for unknown types', () => {
      const result = service.generateSampleQuestTemplates('unknown');
      
      expect(result.objectives).toHaveLength(2);
      expect(result.rewards).toContainEqual(
        expect.objectContaining({ type: 'experience', value: 200 })
      );
    });
  });

  describe('generateRewardText', () => {
    it('should generate text for single reward', () => {
      const rewards = [{ type: 'experience', value: 100 }];
      const result = service.generateRewardText(rewards, mockContext);
      
      expect(result).toMatch(/You (gain|earn|receive) 100 experience points\./);
    });

    it('should generate text for multiple rewards', () => {
      const rewards = [
        { type: 'experience', value: 100 },
        { type: 'gold', value: 50 }
      ];
      const result = service.generateRewardText(rewards, mockContext);
      
      expect(result).toContain('Additionally');
    });

    it('should provide default text for no rewards', () => {
      const result = service.generateRewardText([], mockContext);
      expect(result).toBe('You receive recognition for your efforts.');
    });
  });

  describe('generateProgressionText', () => {
    it('should generate start progression text', () => {
      const questData = { name: 'Test Quest' };
      const result = service.generateProgressionText('start', questData, mockContext);
      
      expect(result).toContain('Test Quest');
      expect(result).toMatch(/(quest|mission|task|journey|adventure|challenge)/i);
    });

    it('should generate completion progression text', () => {
      const questData = { name: 'Test Quest' };
      const result = service.generateProgressionText('complete', questData, mockContext);
      
      expect(result).toContain('Test Quest');
      expect(result).toMatch(/(completes|finishes|accomplishes|complete|finished|accomplished)/);
    });
  });
});