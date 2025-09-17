// src/examples/settlement-family-integration-example.js

import Character from '../domain/entities/Character.js';
import SettlementFamilyService from '../domain/services/SettlementFamilyService.js';
import WorldBuilder from '../domain/services/WorldBuilder.js';
import RacialTraits from '../domain/value-objects/RacialTraits.js';

/**
 * Settlement Family Integration Example
 * 
 * Demonstrates how to use SettlementFamilyService to manage family formation
 * and population growth within settlements over multiple turns.
 */
class SettlementFamilyIntegrationExample {
  constructor() {
    this.worldBuilder = new WorldBuilder();
    this.settlementFamilyService = new SettlementFamilyService(this.worldBuilder);
    this.currentTurn = 1;
  }

  /**
   * Example 1: Basic settlement family processing
   */
  async basicSettlementFamilyExample() {
    console.log('\n=== Basic Settlement Family Processing Example ===');

    // Create a test settlement
    const settlement = this.createTestSettlement();
    
    // Create initial population
    const initialCharacters = this.createInitialPopulation();
    
    // Add characters to world and settlement
    initialCharacters.forEach(char => {
      this.worldBuilder.addCharacter(char);
      settlement.assignedCharacters.push(char.id);
    });
    
    console.log(`Initial population: ${settlement.population.total} characters`);
    console.log(`Eligible singles: ${this.settlementFamilyService.getEligibleSingles(initialCharacters).length}`);
    
    // Process family formation for this turn
    const results = this.settlementFamilyService.processFamilyFormation(
      settlement, 
      this.currentTurn,
      { debug: true }
    );
    
    console.log('\nFamily Formation Results:');
    console.log(`- Marriages: ${results.marriages.length}`);
    console.log(`- Births: ${results.births.length}`);
    console.log(`- Population growth: +${results.populationGrowth}`);
    console.log(`- New population: ${results.newPopulation}`);
    
    // Show marriage details
    results.marriages.forEach((marriage, index) => {
      console.log(`\nMarriage ${index + 1}:`);
      console.log(`  ${marriage.partner1.name} (${marriage.partner1.age}) + ${marriage.partner2.name} (${marriage.partner2.age})`);
      console.log(`  Compatibility: ${marriage.compatibility.overallScore.toFixed(2)}`);
    });
    
    // Show birth details
    results.births.forEach((birth, index) => {
      console.log(`\nBirth ${index + 1}:`);
      console.log(`  Parents: ${birth.parent1.name} + ${birth.parent2.name}`);
      console.log(`  Decision probability: ${birth.decision.probability.toFixed(2)}`);
    });
    
    return { settlement, results };
  }

  /**
   * Example 2: Multi-turn simulation
   */
  async multiTurnSimulationExample() {
    console.log('\n=== Multi-Turn Settlement Simulation ===');
    
    const settlement = this.createTestSettlement();
    const initialCharacters = this.createInitialPopulation();
    
    // Initialize settlement
    initialCharacters.forEach(char => {
      this.worldBuilder.addCharacter(char);
      settlement.assignedCharacters.push(char.id);
    });
    
    console.log(`Starting simulation with ${settlement.population.total} characters`);
    
    // Simulate 5 turns
    for (let turn = 1; turn <= 5; turn++) {
      console.log(`\n--- Turn ${turn} ---`);
      
      const results = this.settlementFamilyService.processFamilyFormation(
        settlement, 
        turn,
        { 
          marriageRate: 0.4,     // 40% chance for eligible singles
          procreationRate: 0.6,  // 60% chance for married couples
          debug: false
        }
      );
      
      console.log(`Marriages: ${results.marriages.length}, Births: ${results.births.length}, Population: ${results.newPopulation}`);
      
      // Age the population
      this.settlementFamilyService.processPopulationAging(settlement, turn);
    }
    
    // Final statistics
    const stats = this.settlementFamilyService.getFamilyFormationStats(settlement, 5);
    console.log('\n--- Final Statistics (5 turns) ---');
    console.log(`Total marriages: ${stats.marriages}`);
    console.log(`Total births: ${stats.births}`);
    console.log(`Marriage rate: ${stats.marriageRate.toFixed(2)}%`);
    console.log(`Birth rate: ${stats.birthRate.toFixed(2)}%`);
    console.log(`Population growth: +${stats.populationGrowth}`);
    console.log(`Average marriages per turn: ${stats.averageMarriagesPerTurn.toFixed(1)}`);
    console.log(`Average births per turn: ${stats.averageBirthsPerTurn.toFixed(1)}`);
    
    return { settlement, stats };
  }

  /**
   * Example 3: Settlement with different conditions
   */
  async settlementConditionsExample() {
    console.log('\n=== Settlement Conditions Impact Example ===');
    
    // Create two settlements with different conditions
    const prosperousSettlement = this.createProsperousSettlement();
    const strugglingSettlement = this.createStrugglingSettlement();
    
    // Same initial population for both
    const characters1 = this.createInitialPopulation();
    const characters2 = this.createInitialPopulation();
    
    // Setup settlements
    characters1.forEach(char => {
      this.worldBuilder.addCharacter(char);
      prosperousSettlement.assignedCharacters.push(char.id);
    });
    
    characters2.forEach(char => {
      this.worldBuilder.addCharacter(char);
      strugglingSettlement.assignedCharacters.push(char.id);
    });
    
    console.log('\nProcessing family formation in different settlement conditions...');
    
    // Process family formation in both settlements
    const prosperousResults = this.settlementFamilyService.processFamilyFormation(
      prosperousSettlement, 
      1,
      { debug: false }
    );
    
    const strugglingResults = this.settlementFamilyService.processFamilyFormation(
      strugglingSettlement, 
      1,
      { debug: false }
    );
    
    console.log('\nPROSPEROUS SETTLEMENT RESULTS:');
    console.log(`- Marriages: ${prosperousResults.marriages.length}`);
    console.log(`- Births: ${prosperousResults.births.length}`);
    console.log(`- Population growth: +${prosperousResults.populationGrowth}`);
    
    console.log('\nSTRUGGLING SETTLEMENT RESULTS:');
    console.log(`- Marriages: ${strugglingResults.marriages.length}`);
    console.log(`- Births: ${strugglingResults.births.length}`);
    console.log(`- Population growth: +${strugglingResults.populationGrowth}`);
    
    console.log('\nCOMPARISON:');
    console.log(`Marriage difference: ${prosperousResults.marriages.length - strugglingResults.marriages.length}`);
    console.log(`Birth difference: ${prosperousResults.births.length - strugglingResults.births.length}`);
    
    return { prosperousResults, strugglingResults };
  }

  /**
   * Example 4: Historical event tracking
   */
  async historicalEventTrackingExample() {
    console.log('\n=== Historical Event Tracking Example ===');
    
    const settlement = this.createTestSettlement();
    const characters = this.createInitialPopulation();
    
    characters.forEach(char => {
      this.worldBuilder.addCharacter(char);
      settlement.assignedCharacters.push(char.id);
    });
    
    // Process several turns and track history
    for (let turn = 1; turn <= 3; turn++) {
      console.log(`\nProcessing Turn ${turn}...`);
      
      const results = this.settlementFamilyService.processFamilyFormation(
        settlement, 
        turn,
        { debug: false }
      );
      
      console.log(`Turn ${turn}: ${results.marriages.length} marriages, ${results.births.length} births`);
    }
    
    // Display historical events
    console.log('\n--- Settlement History ---');
    if (settlement.history && settlement.history.length > 0) {
      settlement.history.forEach((event, index) => {
        console.log(`${index + 1}. Turn ${event.turn}: ${event.description}`);
        if (event.type === 'marriage') {
          console.log(`   Compatibility: ${event.data.compatibility?.overallScore?.toFixed(2) || 'N/A'}`);
        } else if (event.type === 'birth') {
          console.log(`   Decision probability: ${event.data.decision?.probability?.toFixed(2) || 'N/A'}`);
        }
      });
    } else {
      console.log('No historical events recorded.');
    }
    
    return settlement;
  }

  /**
   * Create a basic test settlement
   */
  createTestSettlement() {
    return {
      id: 'test_settlement',
      name: 'Riverside Village',
      population: {
        total: 0,
        growth: 0.02
      },
      assignedCharacters: [],
      resources: {
        amounts: {
          food: 120,
          water: 150,
          materials: 80
        }
      },
      government: {
        type: 'council',
        laws: [
          { id: 'marriage_law', description: 'Marriage regulations' },
          { id: 'child_protection', description: 'Child protection laws' }
        ]
      },
      economy: {
        averageWealth: 200,
        averageIncome: 60
      },
      culture: {
        language: 'common',
        traditions: ['harvest_festival', 'marriage_ceremony'],
        values: { family: 0.8, community: 0.7 }
      },
      socialFactors: {
        happiness: 75,
        stability: 80
      },
      demographics: {
        children: 0,
        ageDistribution: {}
      },
      history: []
    };
  }

  /**
   * Create a prosperous settlement
   */
  createProsperousSettlement() {
    const settlement = this.createTestSettlement();
    settlement.id = 'prosperous_settlement';
    settlement.name = 'Golden Haven';
    
    // Better conditions
    settlement.resources.amounts = { food: 200, water: 250, materials: 150 };
    settlement.economy = { averageWealth: 400, averageIncome: 120 };
    settlement.socialFactors = { happiness: 90, stability: 95 };
    
    return settlement;
  }

  /**
   * Create a struggling settlement
   */
  createStrugglingSettlement() {
    const settlement = this.createTestSettlement();
    settlement.id = 'struggling_settlement';
    settlement.name = 'Hardscrabble';
    
    // Worse conditions
    settlement.resources.amounts = { food: 40, water: 60, materials: 30 };
    settlement.economy = { averageWealth: 80, averageIncome: 25 };
    settlement.socialFactors = { happiness: 45, stability: 40 };
    settlement.government.laws = []; // No laws
    
    return settlement;
  }

  /**
   * Create initial population of characters
   */
  createInitialPopulation() {
    const characters = [];
    
    // Create 12 characters of various ages and personalities
    const characterData = [
      { name: 'Alice Brightwater', age: 24, empathy: 0.8, patience: 0.7, aggression: 0.2 },
      { name: 'Bob Ironforge', age: 26, empathy: 0.6, patience: 0.6, aggression: 0.4 },
      { name: 'Clara Swiftarrow', age: 22, empathy: 0.9, patience: 0.8, aggression: 0.1 },
      { name: 'David Stormwind', age: 28, empathy: 0.5, patience: 0.5, aggression: 0.6 },
      { name: 'Elena Moonwhisper', age: 23, empathy: 0.8, patience: 0.9, aggression: 0.1 },
      { name: 'Felix Goldleaf', age: 29, empathy: 0.7, patience: 0.6, aggression: 0.3 },
      { name: 'Grace Starweaver', age: 25, empathy: 0.9, patience: 0.8, aggression: 0.2 },
      { name: 'Henry Flameheart', age: 31, empathy: 0.4, patience: 0.4, aggression: 0.8 },
      { name: 'Ivy Thornbush', age: 27, empathy: 0.7, patience: 0.7, aggression: 0.3 },
      { name: 'Jack Windwalker', age: 30, empathy: 0.6, patience: 0.5, aggression: 0.5 },
      { name: 'Kate Silverstone', age: 26, empathy: 0.8, patience: 0.8, aggression: 0.2 },
      { name: 'Liam Earthshaker', age: 32, empathy: 0.5, patience: 0.6, aggression: 0.7 }
    ];
    
    characterData.forEach((data, index) => {
      const character = new Character({
        id: `char_${index + 1}`,
        name: data.name,
        age: data.age,
        baseAttributes: {
          strength: 10 + Math.floor(Math.random() * 8),
          dexterity: 10 + Math.floor(Math.random() * 8),
          constitution: 12 + Math.floor(Math.random() * 6),
          intelligence: 10 + Math.floor(Math.random() * 8),
          wisdom: 12 + Math.floor(Math.random() * 6),
          charisma: 10 + Math.floor(Math.random() * 8)
        },
        personalityConfig: {
          traits: [
            { id: 'empathy', intensity: data.empathy },
            { id: 'patience', intensity: data.patience },
            { id: 'aggression', intensity: data.aggression },
            { id: 'loyalty', intensity: 0.7 + Math.random() * 0.3 },
            { id: 'curiosity', intensity: 0.5 + Math.random() * 0.4 }
          ]
        },
        consciousness: {
          frequency: 35 + Math.random() * 20,
          coherence: 0.5 + Math.random() * 0.4
        },
        racialTraits: new RacialTraits(Math.random() < 0.7 ? 'human' : 'elf'),
        resources: {
          wealth: 100 + Math.random() * 300,
          income: 40 + Math.random() * 60,
          property: Math.random() < 0.4 ? 1 : 0
        },
        health: 80 + Math.random() * 20,
        relationshipStatus: 'single'
      });
      
      characters.push(character);
    });
    
    return characters;
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🏘️ Settlement Family Integration Examples 🏘️');
    console.log('================================================');
    
    try {
      await this.basicSettlementFamilyExample();
      await this.multiTurnSimulationExample();
      await this.settlementConditionsExample();
      await this.historicalEventTrackingExample();
      
      console.log('\n🎉 All settlement family integration examples completed successfully! 🎉');
      console.log('\nKey Features Demonstrated:');
      console.log('✓ Marriage decision processing with compatibility evaluation');
      console.log('✓ Procreation decisions based on settlement conditions');
      console.log('✓ Population growth and demographic tracking');
      console.log('✓ Multi-turn simulation and aging');
      console.log('✓ Historical event recording');
      console.log('✓ Settlement condition impact on family formation');
      console.log('✓ Integration with WorldBuilder and existing character systems');
      
    } catch (error) {
      console.error('Error running settlement family examples:', error);
      throw error;
    }
  }
}

// Export for use in other files
export default SettlementFamilyIntegrationExample;

// If running directly, execute examples
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = new SettlementFamilyIntegrationExample();
  example.runAllExamples().catch(console.error);
}
