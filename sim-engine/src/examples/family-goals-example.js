/**
 * Family Aspiration Goal System Example
 *
 * This example demonstrates how to use the sophisticated goal system
 * for family aspirations in the world history simulation engine.
 */

import TemplateManager from '../template/TemplateManager.js';
import FamilyAspirationGoals from '../template/FamilyAspirationGoals.js';

class FamilyGoalsExample {
  constructor() {
    this.templateManager = new TemplateManager();
    this.familyGoals = new FamilyAspirationGoals(this.templateManager);
  }

  /**
   * Initialize the family goal system
   */
  async initialize() {
    console.log('=== Initializing Family Aspiration Goal System ===');

    // Initialize all family goal templates
    this.familyGoals.initializeTemplates();
    console.log('Family goal templates initialized successfully');

    // Display available templates
    const allGoals = this.familyGoals.getAllFamilyGoals();
    console.log(`Available family goals: ${allGoals.length}`);
    allGoals.forEach(goal => {
      console.log(`- ${goal.name}: ${goal.description}`);
    });
  }

  /**
   * Example 1: Young adult seeking romance
   */
  async romanceExample() {
    console.log('\n=== Romance Example ===');

    // Create a young character looking for love
    const youngAdult = {
      id: 'alice_young',
      name: 'Alice',
      age: 25,
      attributes: {
        charisma: { score: 14, modifier: 2 },
        wisdom: { score: 12, modifier: 1 },
        constitution: { score: 13, modifier: 1 }
      },
      personality: {
        empathy: 0.7,
        openness: 0.8,
        extraversion: 0.6
      },
      relationship_status: 'single',
      resources: {
        income: 50,
        savings: 100
      }
    };

    console.log(`Character: ${youngAdult.name}, Age: ${youngAdult.age}, Status: ${youngAdult.relationship_status}`);

    // Get available family goals for this character
    const availableGoals = this.familyGoals.getAvailableFamilyGoalsForCharacter(youngAdult);
    console.log(`Available goals: ${availableGoals.map(g => g.name).join(', ')}`);

    // Instantiate the "Find Partner" goal
    const partnerGoal = this.templateManager.instantiateGoalTemplate('find_partner', youngAdult);
    console.log(`Started goal: ${partnerGoal.name}`);
    console.log(`Steps: ${partnerGoal.steps.map(s => s.name).join(' → ')}`);

    // Simulate progress through goal steps
    await this.simulateGoalProgress(partnerGoal, youngAdult, [
      { action: 'socialize', step: 0 },
      { action: 'meet_people', step: 1 },
      { action: 'converse', step: 1 },
      { action: 'date', step: 2 },
      { action: 'propose_marriage', step: 3 }
    ]);

    return partnerGoal;
  }

  /**
   * Example 2: Married couple starting a family
   */
  async familyBuildingExample() {
    console.log('\n=== Family Building Example ===');

    // Create a married character ready for parenthood
    const marriedAdult = {
      id: 'bob_married',
      name: 'Bob',
      age: 32,
      attributes: {
        charisma: { score: 12, modifier: 1 },
        wisdom: { score: 15, modifier: 2 },
        constitution: { score: 14, modifier: 2 }
      },
      personality: {
        empathy: 0.8,
        responsibility: 0.9,
        patience: 0.7
      },
      relationship_status: 'married',
      resources: {
        housing: 1,
        income: 120,
        savings: 300
      }
    };

    console.log(`Character: ${marriedAdult.name}, Age: ${marriedAdult.age}, Status: ${marriedAdult.relationship_status}`);

    // Get available family goals
    const availableGoals = this.familyGoals.getAvailableFamilyGoalsForCharacter(marriedAdult);
    console.log(`Available goals: ${availableGoals.map(g => g.name).join(', ')}`);

    // Start the family building goal
    const familyGoal = this.templateManager.instantiateGoalTemplate('start_family', marriedAdult);
    console.log(`Started goal: ${familyGoal.name}`);
    console.log(`Requirements met: Housing ✓, Income ✓, Age ✓`);

    // Simulate family building progress
    await this.simulateGoalProgress(familyGoal, marriedAdult, [
      { action: 'purchase_house', step: 0 },
      { action: 'study_childcare', step: 1 },
      { action: 'intimate_encounter', step: 2 },
      { action: 'prepare_nursery', step: 3 }
    ]);

    return familyGoal;
  }

  /**
   * Example 3: Parent raising children
   */
  async parentingExample() {
    console.log('\n=== Parenting Example ===');

    // Create a parent with children
    const parent = {
      id: 'carol_parent',
      name: 'Carol',
      age: 35,
      attributes: {
        wisdom: { score: 16, modifier: 3 },
        charisma: { score: 13, modifier: 1 },
        constitution: { score: 12, modifier: 1 }
      },
      personality: {
        patience: 0.8,
        nurturing: 0.9,
        responsibility: 0.85
      },
      relationship_status: 'married',
      resources: {
        housing: 1,
        income: 150,
        savings: 500
      },
      children: 2 // Has children
    };

    console.log(`Character: ${parent.name}, Age: ${parent.age}, Children: ${parent.children}`);

    // Get available family goals
    const availableGoals = this.familyGoals.getAvailableFamilyGoalsForCharacter(parent);
    console.log(`Available goals: ${availableGoals.map(g => g.name).join(', ')}`);

    // Start the parenting goal
    const parentingGoal = this.templateManager.instantiateGoalTemplate('raise_family', parent);
    console.log(`Started goal: ${parentingGoal.name}`);
    console.log(`Long-term commitment: ${parentingGoal.metadata.estimated_duration} days`);

    // Simulate early parenting progress
    await this.simulateGoalProgress(parentingGoal, parent, [
      { action: 'feed_child', step: 0 },
      { action: 'bond_with_child', step: 0 },
      { action: 'teach_basic_skills', step: 1 }
    ]);

    return parentingGoal;
  }

  /**
   * Example 4: Elder building family legacy
   */
  async legacyExample() {
    console.log('\n=== Family Legacy Example ===');

    // Create an established family head
    const elder = {
      id: 'david_elder',
      name: 'David',
      age: 55,
      attributes: {
        wisdom: { score: 18, modifier: 4 },
        charisma: { score: 15, modifier: 2 },
        intelligence: { score: 16, modifier: 3 }
      },
      personality: {
        leadership: 0.9,
        tradition: 0.85,
        foresight: 0.8
      },
      relationship_status: 'married',
      resources: {
        wealth: 2000,
        property: 8,
        income: 300,
        housing: 2
      },
      children: 3
    };

    console.log(`Character: ${elder.name}, Age: ${elder.age}, Wealth: ${elder.resources.wealth}`);

    // Get available family goals
    const availableGoals = this.familyGoals.getAvailableFamilyGoalsForCharacter(elder);
    console.log(`Available goals: ${availableGoals.map(g => g.name).join(', ')}`);

    // Start the legacy goal
    const legacyGoal = this.templateManager.instantiateGoalTemplate('family_legacy', elder);
    console.log(`Started goal: ${legacyGoal.name}`);
    console.log(`Difficulty: ${legacyGoal.metadata.difficulty}`);
    console.log(`Historical significance: ${legacyGoal.metadata.historical_significance}`);

    // Simulate legacy building progress
    await this.simulateGoalProgress(legacyGoal, elder, [
      { action: 'start_business', step: 0 },
      { action: 'invest_wisely', step: 1 },
      { action: 'hire_tutors', step: 2 }
    ]);

    return legacyGoal;
  }

  /**
   * Simulate goal progress through actions
   */
  async simulateGoalProgress(goal, character, actions) {
    console.log(`\nSimulating progress for: ${goal.name}`);

    for (const { action, step } of actions) {
      // Update goal progress based on action
      const updatedGoal = this.templateManager.updateGoalProgress(goal, action, {
        character,
        stepIndex: step
      });

      // Find the current step
      const currentStep = updatedGoal.steps[updatedGoal.currentStep];
      const stepName = currentStep ? currentStep.name : 'Complete';

      console.log(`Action: ${action} → Step: ${stepName} (${updatedGoal.progress.toFixed(1)}% complete)`);

      // Check if goal completed
      if (updatedGoal.status === 'completed') {
        console.log(`🎉 Goal completed! Rewards: ${JSON.stringify(updatedGoal.rewards, null, 2)}`);
        break;
      }
    }
  }

  /**
   * Run all family goal examples
   */
  async runAllExamples() {
    try {
      await this.initialize();

      await this.romanceExample();
      await this.familyBuildingExample();
      await this.parentingExample();
      await this.legacyExample();

      console.log('\n=== All Family Goal Examples Completed ===');
      console.log('The goal system successfully supports:');
      console.log('• Romantic relationship building');
      console.log('• Family establishment and growth');
      console.log('• Long-term parenting commitments');
      console.log('• Multi-generational legacy building');

    } catch (error) {
      console.error('Error running examples:', error);
    }
  }
}

// Export for use in other modules
export default FamilyGoalsExample;

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = new FamilyGoalsExample();
  example.runAllExamples();
}
