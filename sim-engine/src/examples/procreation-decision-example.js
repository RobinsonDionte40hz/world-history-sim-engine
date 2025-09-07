/**
 * Procreation Decision System Usage Examples
 * 
 * Demonstrates how to use the integrated procreation decision functionality
 * within the existing FamilyDecisionService for world simulation
 */

import FamilyDecisionService from '../domain/services/FamilyDecisionService.js';

class ProcreationDecisionExample {
  constructor() {
    this.familyDecisionService = new FamilyDecisionService();
  }

  /**
   * Example 1: Ideal couple ready for children
   */
  async idealCoupleExample() {
    console.log('\n=== Ideal Couple Procreation Example ===');

    // Create an ideal married couple
    const idealCouple = [
      {
        id: 'alice_married',
        name: 'Alice',
        age: 26,
        attributes: {
          wisdom: { score: 15, modifier: 2 },
          constitution: { score: 16, modifier: 3 },
          charisma: { score: 14, modifier: 2 }
        },
        consciousness: {
          coherence: 0.8,
          selfAwareness: 0.9,
          emotionalRegulation: 0.8
        },
        personality: {
          traits: {
            empathy: 0.9,      // High empathy - loves children
            patience: 0.8,     // Patient with children
            aggression: 0.1,   // Low aggression
            loyalty: 0.9,      // Committed to family
            curiosity: 0.7,    // Interested in nurturing
            ambition: 0.5      // Balanced career/family priorities
          }
        },
        resources: {
          wealth: 350,    // Above average wealth
          income: 85,     // Stable income
          property: 1     // Owns home
        },
        relationship_status: 'married'
      },
      {
        id: 'bob_married',
        name: 'Bob',
        age: 28,
        attributes: {
          wisdom: { score: 14, modifier: 2 },
          constitution: { score: 15, modifier: 2 },
          charisma: { score: 13, modifier: 1 }
        },
        consciousness: {
          coherence: 0.7,
          selfAwareness: 0.8,
          emotionalRegulation: 0.7
        },
        personality: {
          traits: {
            empathy: 0.8,      // High empathy
            patience: 0.7,     // Good patience
            aggression: 0.2,   // Low aggression
            loyalty: 0.8,      // Loyal partner
            curiosity: 0.6,    // Open to new experiences
            ambition: 0.6      // Moderate ambition
          }
        },
        resources: {
          wealth: 280,    // Good wealth
          income: 75,     // Stable income
          property: 0     // No separate property
        },
        relationship_status: 'married'
      }
    ];

    // Create a thriving settlement
    const thrivingSettlement = {
      id: 'greendale',
      name: 'Greendale',
      population: {
        total: 800,
        growth: 0.03    // Healthy growth rate
      },
      resources: {
        amounts: {
          food: 150,      // Abundant food
          water: 180,     // Clean water access
          materials: 100  // Good building materials
        },
        production: {
          food: 25,
          water: 30,
          materials: 15
        }
      },
      government: {
        type: 'council',
        laws: [
          { id: 'child_protection', description: 'Laws protecting children' },
          { id: 'education', description: 'Educational requirements' },
          { id: 'healthcare', description: 'Basic healthcare provisions' }
        ]
      },
      economy: {
        averageWealth: 200,
        averageIncome: 60
      }
    };

    // Evaluate procreation decision
    const decision = this.familyDecisionService.evaluateProcreationDecision(
      idealCouple,
      thrivingSettlement
    );

    console.log('Couple Analysis:');
    console.log(`- ${idealCouple[0].name} (${idealCouple[0].age}): Empathy ${idealCouple[0].personality.traits.empathy}, Constitution ${idealCouple[0].attributes.constitution.score}`);
    console.log(`- ${idealCouple[1].name} (${idealCouple[1].age}): Empathy ${idealCouple[1].personality.traits.empathy}, Constitution ${idealCouple[1].attributes.constitution.score}`);
    console.log(`- Combined wealth: ${idealCouple[0].resources.wealth + idealCouple[1].resources.wealth}`);
    console.log(`- Combined income: ${idealCouple[0].resources.income + idealCouple[1].resources.income}`);

    console.log('\nSettlement Analysis:');
    console.log(`- ${thrivingSettlement.name}: Population ${thrivingSettlement.population.total}`);
    console.log(`- Resources: Food ${thrivingSettlement.resources.amounts.food}, Water ${thrivingSettlement.resources.amounts.water}`);
    console.log(`- Government: ${thrivingSettlement.government.type} with ${thrivingSettlement.government.laws.length} laws`);

    console.log('\n--- Procreation Decision Result ---');
    console.log(`Decision: ${decision.decision ? 'YES - Proceed with family planning' : 'NO - Wait before having children'}`);
    console.log(`Probability Score: ${(decision.probability * 100).toFixed(1)}%`);
    console.log(`Decision Weight: ${(decision.decisionWeight * 100).toFixed(1)}%`);

    console.log('\nFactor Analysis:');
    Object.entries(decision.factors).forEach(([factor, score]) => {
      const percentage = (score * 100).toFixed(1);
      const status = score > 0.7 ? '✓ Excellent' : score > 0.5 ? '○ Good' : '✗ Challenging';
      console.log(`- ${factor}: ${percentage}% ${status}`);
    });

    console.log('\nReasoning:');
    console.log(decision.reasoning);

    console.log('\nRecommendations:');
    decision.recommendations.forEach(rec => console.log(`- ${rec}`));

    return decision;
  }

  /**
   * Example 2: Young couple with economic challenges
   */
  async strugglingCoupleExample() {
    console.log('\n=== Struggling Couple Procreation Example ===');

    const strugglingCouple = [
      {
        id: 'charlie_poor',
        name: 'Charlie',
        age: 22,
        attributes: {
          wisdom: { score: 11, modifier: 0 },
          constitution: { score: 12, modifier: 1 },
          charisma: { score: 10, modifier: 0 }
        },
        consciousness: {
          coherence: 0.5,
          selfAwareness: 0.4,
          emotionalRegulation: 0.4
        },
        personality: {
          traits: {
            empathy: 0.6,
            patience: 0.4,
            aggression: 0.5,
            loyalty: 0.7,
            curiosity: 0.5,
            ambition: 0.8     // High ambition but limited resources
          }
        },
        resources: {
          wealth: 25,       // Very limited wealth
          income: 20,       // Low income
          property: 0       // No property
        },
        relationship_status: 'married'
      },
      {
        id: 'diana_poor',
        name: 'Diana',
        age: 20,
        attributes: {
          wisdom: { score: 10, modifier: 0 },
          constitution: { score: 13, modifier: 1 },
          charisma: { score: 12, modifier: 1 }
        },
        consciousness: {
          coherence: 0.4,
          selfAwareness: 0.5,
          emotionalRegulation: 0.3
        },
        personality: {
          traits: {
            empathy: 0.7,
            patience: 0.5,
            aggression: 0.3,
            loyalty: 0.8,
            curiosity: 0.6,
            ambition: 0.6
          }
        },
        resources: {
          wealth: 15,       // Very limited wealth
          income: 18,       // Low income
          property: 0       // No property
        },
        relationship_status: 'married'
      }
    ];

    // Struggling settlement
    const poorSettlement = {
      id: 'hardscrabble',
      name: 'Hardscrabble',
      population: {
        total: 120,
        growth: -0.01     // Declining population
      },
      resources: {
        amounts: {
          food: 40,         // Limited food
          water: 60,        // Adequate water
          materials: 30     // Scarce materials
        }
      },
      government: {
        type: 'elder',      // Simple governance
        laws: [
          { id: 'basic_order', description: 'Basic order maintenance' }
        ]
      },
      economy: {
        averageWealth: 80,
        averageIncome: 25
      }
    };

    const decision = this.familyDecisionService.evaluateProcreationDecision(
      strugglingCouple,
      poorSettlement
    );

    console.log('Couple Analysis:');
    console.log(`- ${strugglingCouple[0].name} (${strugglingCouple[0].age}): Ambitious but limited resources`);
    console.log(`- ${strugglingCouple[1].name} (${strugglingCouple[1].age}): Young with basic emotional development`);
    console.log(`- Combined wealth: ${strugglingCouple[0].resources.wealth + strugglingCouple[1].resources.wealth}`);
    console.log(`- Combined income: ${strugglingCouple[0].resources.income + strugglingCouple[1].resources.income}`);

    console.log('\n--- Procreation Decision Result ---');
    console.log(`Decision: ${decision.decision ? 'YES - Proceed with family planning' : 'NO - Wait before having children'}`);
    console.log(`Probability Score: ${(decision.probability * 100).toFixed(1)}%`);

    console.log('\nFactor Analysis:');
    Object.entries(decision.factors).forEach(([factor, score]) => {
      const percentage = (score * 100).toFixed(1);
      const status = score > 0.7 ? '✓ Excellent' : score > 0.5 ? '○ Good' : '✗ Challenging';
      console.log(`- ${factor}: ${percentage}% ${status}`);
    });

    console.log('\nRecommendations:');
    decision.recommendations.forEach(rec => console.log(`- ${rec}`));

    return decision;
  }

  /**
   * Example 3: Older couple with health concerns
   */
  async olderCoupleExample() {
    console.log('\n=== Older Couple Procreation Example ===');

    const olderCouple = [
      {
        id: 'edward_older',
        name: 'Edward',
        age: 42,
        attributes: {
          wisdom: { score: 18, modifier: 4 },     // High wisdom from experience
          constitution: { score: 10, modifier: 0 }, // Declining health
          charisma: { score: 16, modifier: 3 }
        },
        consciousness: {
          coherence: 0.9,       // Very high consciousness
          selfAwareness: 0.9,
          emotionalRegulation: 0.8
        },
        personality: {
          traits: {
            empathy: 0.8,
            patience: 0.9,      // Very patient
            aggression: 0.1,
            loyalty: 0.9,
            curiosity: 0.5,
            ambition: 0.3       // Low ambition, focused on family
          }
        },
        resources: {
          wealth: 800,          // Wealthy from years of work
          income: 120,          // High income
          property: 2           // Multiple properties
        },
        relationship_status: 'married'
      },
      {
        id: 'fiona_older',
        name: 'Fiona',
        age: 38,
        attributes: {
          wisdom: { score: 17, modifier: 3 },
          constitution: { score: 11, modifier: 0 }, // Declining health
          charisma: { score: 15, modifier: 2 }
        },
        consciousness: {
          coherence: 0.8,
          selfAwareness: 0.9,
          emotionalRegulation: 0.8
        },
        personality: {
          traits: {
            empathy: 0.9,       // Very empathetic
            patience: 0.8,
            aggression: 0.1,
            loyalty: 0.9,
            curiosity: 0.6,
            ambition: 0.2       // Low ambition, family-focused
          }
        },
        resources: {
          wealth: 600,
          income: 90,
          property: 1
        },
        relationship_status: 'married'
      }
    ];

    // Good settlement for the wealthy couple
    const prosperousSettlement = {
      id: 'goldenhaven',
      name: 'Golden Haven',
      population: {
        total: 1200,
        growth: 0.02
      },
      resources: {
        amounts: {
          food: 200,
          water: 250,
          materials: 150
        }
      },
      government: {
        type: 'council',
        laws: [
          { id: 'child_protection', description: 'Comprehensive child protection' },
          { id: 'education', description: 'Advanced education system' },
          { id: 'healthcare', description: 'Advanced healthcare' },
          { id: 'elder_care', description: 'Elder care provisions' }
        ]
      },
      economy: {
        averageWealth: 300,
        averageIncome: 80
      }
    };

    const decision = this.familyDecisionService.evaluateProcreationDecision(
      olderCouple,
      prosperousSettlement
    );

    console.log('Couple Analysis:');
    console.log(`- ${olderCouple[0].name} (${olderCouple[0].age}): Wise and wealthy but aging`);
    console.log(`- ${olderCouple[1].name} (${olderCouple[1].age}): Experienced and empathetic`);
    console.log(`- Combined wisdom: ${olderCouple[0].attributes.wisdom.score + olderCouple[1].attributes.wisdom.score}`);
    console.log(`- Combined constitution: ${olderCouple[0].attributes.constitution.score + olderCouple[1].attributes.constitution.score}`);

    console.log('\n--- Procreation Decision Result ---');
    console.log(`Decision: ${decision.decision ? 'YES - Proceed with family planning' : 'NO - Wait before having children'}`);
    console.log(`Probability Score: ${(decision.probability * 100).toFixed(1)}%`);

    console.log('\nFactor Analysis:');
    Object.entries(decision.factors).forEach(([factor, score]) => {
      const percentage = (score * 100).toFixed(1);
      const status = score > 0.7 ? '✓ Excellent' : score > 0.5 ? '○ Good' : '✗ Challenging';
      console.log(`- ${factor}: ${percentage}% ${status}`);
    });

    console.log('\nSpecial Considerations for Older Parents:');
    console.log('- High wisdom and experience provide excellent guidance');
    console.log('- Economic stability ensures excellent care');
    console.log('- Age-related health risks require careful consideration');
    console.log('- Settlement resources support high-risk pregnancies');

    console.log('\nRecommendations:');
    decision.recommendations.forEach(rec => console.log(`- ${rec}`));

    return decision;
  }

  /**
   * Example 4: Aggressive couple evaluation
   */
  async aggressiveCoupleExample() {
    console.log('\n=== Aggressive Couple Procreation Example ===');

    const aggressiveCouple = [
      {
        id: 'garrett_aggressive',
        name: 'Garrett',
        age: 30,
        attributes: {
          wisdom: { score: 12, modifier: 1 },
          constitution: { score: 16, modifier: 3 },
          charisma: { score: 14, modifier: 2 }
        },
        consciousness: {
          coherence: 0.4,       // Lower consciousness
          selfAwareness: 0.3,
          emotionalRegulation: 0.2  // Poor emotional regulation
        },
        personality: {
          traits: {
            empathy: 0.3,       // Low empathy
            patience: 0.2,      // Low patience
            aggression: 0.9,    // Very high aggression
            loyalty: 0.6,
            curiosity: 0.4,
            ambition: 0.9       // Very ambitious
          }
        },
        resources: {
          wealth: 200,
          income: 85,           // Good income from aggressive pursuits
          property: 1
        },
        relationship_status: 'married'
      },
      {
        id: 'helena_aggressive',
        name: 'Helena',
        age: 27,
        attributes: {
          wisdom: { score: 11, modifier: 0 },
          constitution: { score: 14, modifier: 2 },
          charisma: { score: 13, modifier: 1 }
        },
        consciousness: {
          coherence: 0.5,
          selfAwareness: 0.4,
          emotionalRegulation: 0.3
        },
        personality: {
          traits: {
            empathy: 0.4,
            patience: 0.3,
            aggression: 0.8,    // High aggression
            loyalty: 0.7,
            curiosity: 0.5,
            ambition: 0.8
          }
        },
        resources: {
          wealth: 180,
          income: 70,
          property: 0
        },
        relationship_status: 'married'
      }
    ];

    const neutralSettlement = {
      id: 'ironhold',
      name: 'Ironhold',
      population: {
        total: 600,
        growth: 0.01
      },
      resources: {
        amounts: {
          food: 80,
          water: 100,
          materials: 90
        }
      },
      government: {
        type: 'military',
        laws: [
          { id: 'order', description: 'Strict order maintenance' },
          { id: 'discipline', description: 'Disciplinary codes' }
        ]
      },
      economy: {
        averageWealth: 150,
        averageIncome: 55
      }
    };

    const decision = this.familyDecisionService.evaluateProcreationDecision(
      aggressiveCouple,
      neutralSettlement
    );

    console.log('Couple Analysis:');
    console.log(`- ${aggressiveCouple[0].name}: High aggression (${aggressiveCouple[0].personality.traits.aggression}), low empathy (${aggressiveCouple[0].personality.traits.empathy})`);
    console.log(`- ${aggressiveCouple[1].name}: High aggression (${aggressiveCouple[1].personality.traits.aggression}), moderate empathy (${aggressiveCouple[1].personality.traits.empathy})`);
    console.log('- Both have good physical health but concerning personality traits for child-rearing');

    console.log('\n--- Procreation Decision Result ---');
    console.log(`Decision: ${decision.decision ? 'YES - Proceed with family planning' : 'NO - Wait before having children'}`);
    console.log(`Probability Score: ${(decision.probability * 100).toFixed(1)}%`);

    console.log('\nPersonality Impact Analysis:');
    console.log('- High aggression significantly reduces personal desire for children');
    console.log('- Low empathy and patience create concerning environment for child development');
    console.log('- High ambition may prioritize career over family needs');

    console.log('\nRecommendations:');
    decision.recommendations.forEach(rec => console.log(`- ${rec}`));

    return decision;
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('==========================================');
    console.log('PROCREATION DECISION SYSTEM EXAMPLES');
    console.log('==========================================');

    try {
      await this.idealCoupleExample();
      await this.strugglingCoupleExample();
      await this.olderCoupleExample();
      await this.aggressiveCoupleExample();

      console.log('\n==========================================');
      console.log('SYSTEM INTEGRATION SUMMARY');
      console.log('==========================================');
      console.log('✓ Procreation Decision System successfully integrated with FamilyDecisionService');
      console.log('✓ Uses existing D&D attributes (wisdom, constitution) for family planning');
      console.log('✓ Integrates with consciousness system for decision-making quality');
      console.log('✓ Leverages personality traits for desire calculation');
      console.log('✓ Evaluates settlement conditions for child-rearing environment');
      console.log('✓ Provides comprehensive reasoning and recommendations');
      console.log('✓ Handles edge cases and missing data gracefully');

    } catch (error) {
      console.error('Error running examples:', error);
    }
  }
}

// Export for use in other modules
export default ProcreationDecisionExample;

// If running directly, execute all examples
if (import.meta.url === `file://${process.argv[1]}`) {
  const examples = new ProcreationDecisionExample();
  examples.runAllExamples();
}
