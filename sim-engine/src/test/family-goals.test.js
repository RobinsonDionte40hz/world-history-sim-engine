/**
 * Family Aspiration Goals Test Suite
 *
 * Tests for the family aspiration goal system including template validation,
 * goal instantiation, progress tracking, and character compatibility.
 */

import TemplateManager from '../template/TemplateManager.js';
import FamilyAspirationGoals from '../template/FamilyAspirationGoals.js';

describe('Family Aspiration Goal System', () => {
  let templateManager;
  let familyGoals;

  beforeEach(() => {
    templateManager = new TemplateManager();
    familyGoals = new FamilyAspirationGoals(templateManager);
    familyGoals.initializeTemplates();
  });

  describe('Template Creation and Validation', () => {
    test('should create all family goal templates successfully', () => {
      const templates = familyGoals.getAllFamilyGoals();
      expect(templates).toHaveLength(4);

      const templateNames = templates.map(t => t.name);
      expect(templateNames).toContain('Find a Partner');
      expect(templateNames).toContain('Start a Family');
      expect(templateNames).toContain('Raise a Family');
      expect(templateNames).toContain('Build Family Legacy');
    });

    test('should validate template structure correctly', () => {
      const findPartnerTemplate = templateManager.getTemplate('goals', 'find_partner');

      expect(findPartnerTemplate.type).toBe('social');
      expect(findPartnerTemplate.category).toBe('family');
      expect(findPartnerTemplate.priority).toBe('medium');
      expect(Array.isArray(findPartnerTemplate.steps)).toBe(true);
      expect(findPartnerTemplate.steps).toHaveLength(4);
    });

    test('should have proper requirements for each template', () => {
      const startFamilyTemplate = templateManager.getTemplate('goals', 'start_family');

      expect(startFamilyTemplate.requirements.relationship_status).toBe('married');
      expect(startFamilyTemplate.requirements.resources.housing).toBe(1);
      expect(startFamilyTemplate.requirements.resources.income).toBe(100);
      expect(startFamilyTemplate.requirements.attributes.constitution).toBe(12);
    });
  });

  describe('Character Compatibility', () => {
    test('should identify available goals for young single character', () => {
      const youngSingle = {
        id: 'young_single',
        age: 22,
        attributes: { charisma: { score: 14 } },
        personality: { empathy: 0.8 },
        relationship_status: 'single'
      };

      const availableGoals = familyGoals.getAvailableFamilyGoalsForCharacter(youngSingle);

      expect(availableGoals.some(g => g.id === 'find_partner')).toBe(true);
      expect(availableGoals.some(g => g.id === 'start_family')).toBe(false); // Not married
    });

    test('should identify available goals for married character', () => {
      const marriedAdult = {
        id: 'married_adult',
        age: 30,
        attributes: {
          charisma: { score: 12 },
          constitution: { score: 14 },
          wisdom: { score: 12 }
        },
        personality: { empathy: 0.5 },
        relationship_status: 'married',
        resources: { housing: 1, income: 120 }
      };

      const availableGoals = familyGoals.getAvailableFamilyGoalsForCharacter(marriedAdult);

      expect(availableGoals.some(g => g.id === 'find_partner')).toBe(false); // Already married
      expect(availableGoals.some(g => g.id === 'start_family')).toBe(true);
    });

    test('should identify available goals for parent character', () => {
      const parent = {
        id: 'parent',
        age: 35,
        attributes: {
          wisdom: { score: 16 },
          patience: { score: 12 }
        },
        personality: { patience: 0.8 },
        relationship_status: 'married',
        resources: { housing: 1, income: 150 },
        children: 2
      };

      const availableGoals = familyGoals.getAvailableFamilyGoalsForCharacter(parent);

      expect(availableGoals.some(g => g.id === 'raise_family')).toBe(true);
      expect(availableGoals.some(g => g.id === 'family_legacy')).toBe(false); // Not enough wealth
    });

    test('should identify available goals for wealthy elder', () => {
      const wealthyElder = {
        id: 'wealthy_elder',
        age: 50,
        attributes: {
          wisdom: { score: 18 },
          leadership: { score: 14 }
        },
        personality: { leadership: 0.9 },
        relationship_status: 'married',
        resources: { wealth: 1500, property: 6 },
        children: 3
      };

      const availableGoals = familyGoals.getAvailableFamilyGoalsForCharacter(wealthyElder);

      expect(availableGoals.some(g => g.id === 'family_legacy')).toBe(true);
    });
  });

  describe('Goal Instantiation', () => {
    test('should instantiate goal with proper structure', () => {
      const character = {
        id: 'test_char',
        age: 25,
        attributes: { charisma: { score: 14 } },
        personality: { empathy: 0.8 },
        relationship_status: 'single'
      };

      const goal = templateManager.instantiateGoalTemplate('find_partner', character);

      expect(goal.id).toContain('find_partner');
      expect(goal.templateId).toBe('find_partner');
      expect(goal.characterId).toBe(character.id);
      expect(goal.status).toBe('active');
      expect(goal.progress).toBe(0);
      expect(goal.currentStep).toBe(0);
      expect(Array.isArray(goal.steps)).toBe(true);
      expect(goal.steps[0].completed).toBe(false);
    });

    test('should reject instantiation for incompatible character', () => {
      const incompatibleCharacter = {
        id: 'too_young',
        age: 16, // Too young
        attributes: { charisma: { score: 8 } }, // Low charisma
        personality: { empathy: 0.1 }, // Low empathy
        relationship_status: 'single'
      };

      expect(() => {
        templateManager.instantiateGoalTemplate('find_partner', incompatibleCharacter);
      }).toThrow('Character does not meet goal requirements');
    });
  });

  describe('Goal Progress Tracking', () => {
    let character;
    let goal;

    beforeEach(() => {
      character = {
        id: 'progress_test',
        age: 25,
        attributes: { charisma: { score: 14 } },
        personality: { empathy: 0.8 },
        relationship_status: 'single'
      };

      goal = templateManager.instantiateGoalTemplate('find_partner', character);
    });

    test('should update progress when action matches step requirements', () => {
      const updatedGoal = templateManager.updateGoalProgress(goal, 'socialize');

      expect(updatedGoal.steps[0].attempts).toBe(1);
      expect(updatedGoal.steps[0].completed).toBe(true); // Should complete after first attempt
      expect(updatedGoal.currentStep).toBe(1);
      expect(updatedGoal.progress).toBeGreaterThan(0);
    });

    test('should advance to next step when current step completes', () => {
      // Complete first step
      let updatedGoal = templateManager.updateGoalProgress(goal, 'socialize');
      expect(updatedGoal.currentStep).toBe(1);

      // Complete second step
      updatedGoal = templateManager.updateGoalProgress(updatedGoal, 'meet_people');
      expect(updatedGoal.currentStep).toBe(2);

      // Complete third step
      updatedGoal = templateManager.updateGoalProgress(updatedGoal, 'date');
      expect(updatedGoal.currentStep).toBe(3);
    });

    test('should complete goal when all steps are finished', () => {
      // Complete all steps
      const actions = ['socialize', 'meet_people', 'converse', 'date', 'propose_marriage'];

      let currentGoal = goal;
      for (const action of actions) {
        currentGoal = templateManager.updateGoalProgress(currentGoal, action);
      }

      expect(currentGoal.status).toBe('completed');
      expect(currentGoal.progress).toBe(100);
      expect(currentGoal.completedAt).toBeDefined();
    });

    test('should track completed steps correctly', () => {
      let updatedGoal = templateManager.updateGoalProgress(goal, 'socialize');
      expect(updatedGoal.completedSteps).toContain('socialize_in_settlement');

      updatedGoal = templateManager.updateGoalProgress(updatedGoal, 'meet_people');
      expect(updatedGoal.completedSteps).toContain('identify_compatible_partner');
    });
  });

  describe('Goal Rewards and Consequences', () => {
    test('should provide appropriate rewards for goal completion', () => {
      const character = {
        id: 'reward_test',
        age: 25,
        attributes: { charisma: { score: 14 } },
        personality: { empathy: 0.8 },
        relationship_status: 'single'
      };

      const goal = templateManager.instantiateGoalTemplate('find_partner', character);

      // Complete the goal
      const actions = ['socialize', 'meet_people', 'converse', 'date', 'propose_marriage'];
      let completedGoal = goal;
      for (const action of actions) {
        completedGoal = templateManager.updateGoalProgress(completedGoal, action);
      }

      expect(completedGoal.status).toBe('completed');
      expect(completedGoal.rewards.experience).toBe(500);
      expect(completedGoal.rewards.attributes.charisma).toBe(1);
      expect(completedGoal.rewards.relationships.partner).toBe(50);
    });

    test('should have realistic time limits', () => {
      const findPartnerGoal = templateManager.getTemplate('goals', 'find_partner');
      const startFamilyGoal = templateManager.getTemplate('goals', 'start_family');

      expect(findPartnerGoal.success_conditions.time_limit).toBe(180); // 6 months
      expect(startFamilyGoal.success_conditions.time_limit).toBe(180); // 6 months
    });
  });

  describe('Goal Metadata and Difficulty', () => {
    test('should have appropriate difficulty levels', () => {
      const goals = familyGoals.getAllFamilyGoals();

      const difficulties = goals.map(g => g.metadata.difficulty);
      expect(difficulties).toContain('medium');
      expect(difficulties).toContain('hard');
      expect(difficulties).toContain('legendary');
    });

    test('should have realistic duration estimates', () => {
      const findPartnerGoal = templateManager.getTemplate('goals', 'find_partner');
      const raiseFamilyGoal = templateManager.getTemplate('goals', 'raise_family');

      expect(findPartnerGoal.metadata.estimated_duration).toBe(52); // ~2 months
      expect(raiseFamilyGoal.metadata.estimated_duration).toBe(6570); // ~18 years
    });

    test('should have appropriate social and economic impact ratings', () => {
      const legacyGoal = templateManager.getTemplate('goals', 'family_legacy');

      expect(legacyGoal.metadata.social_impact).toBe(0.9);
      expect(legacyGoal.metadata.economic_impact).toBe(0.95);
      expect(legacyGoal.metadata.historical_significance).toBe(0.9);
    });
  });

  describe('Integration with Template System', () => {
    test('should integrate properly with TemplateManager', () => {
      const allGoals = templateManager.getAllTemplates('goals');
      const familyGoalTemplates = allGoals.filter(g => g.category === 'family');

      expect(familyGoalTemplates).toHaveLength(4);
      expect(familyGoalTemplates.every(g => g.tags.includes('family'))).toBe(true);
    });

    test('should support template inheritance and variants', () => {
      const baseTemplate = templateManager.getTemplate('goals', 'find_partner');

      // Create a variant for a specific culture
      const culturalVariant = templateManager.createTemplateVariant('goals', 'find_partner', {
        name: 'Find Partner (Noble Courtship)',
        requirements: {
          ...baseTemplate.requirements,
          social_class: 'noble'
        },
        metadata: {
          ...baseTemplate.metadata,
          cultural_context: 'noble_courtship'
        }
      });

      expect(culturalVariant.name).toContain('Noble Courtship');
      expect(culturalVariant.requirements.social_class).toBe('noble');
    });
  });
});
