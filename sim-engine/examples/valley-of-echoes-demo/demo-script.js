/**
 * Valley of Echoes Demo Orchestration Script
 *
 * Orchestrates the complete Valley of Echoes two-settlement demo,
 * including world building, simulation execution, and result analysis.
 */

const oakwoodFederationConfig = require('./oakwood-federation/config.js');
const ironholdDominionConfig = require('./ironhold-dominion/config.js');
const multiSettlementQuests = require('./quests/multi-settlement-quests.js');
const processTurnWithLOD = require('../../src/application/use-cases/simulation/ProcessTurnWithLOD.js');
const LODManager = require('../../src/domain/services/LODManager.js');
const HistoryGenerator = require('../../src/domain/services/HistoryGenerator.js');
const WorldBuilder = require('../../src/domain/services/WorldBuilder.js');

/**
 * Creates system interactions for the demo
 * @returns {Array} Array of system interaction objects
 */
function createSystemInteractions() {
  const systemInteractions = [];

  // Wait interaction
  systemInteractions.push({
    id: 'wait_interaction',
    name: 'Wait',
    type: 'wait',
    requirements: { energy: 0 },
    branches: [{
      id: 'wait_success',
      name: 'Wait Successfully',
      conditions: [],
      effects: [{ type: 'energy', value: 10 }]
    }],
    effects: [],
    context: { duration: 1 }
  });

  // Rest interaction
  systemInteractions.push({
    id: 'rest_interaction',
    name: 'Rest',
    type: 'rest',
    requirements: { energy: 20 },
    branches: [{
      id: 'rest_success',
      name: 'Rest Successfully',
      conditions: [],
      effects: [{ type: 'energy', value: 50 }]
    }],
    effects: [],
    context: { duration: 2 }
  });

  // Examine interaction
  systemInteractions.push({
    id: 'examine_interaction',
    name: 'Examine',
    type: 'examine',
    requirements: { energy: 5 },
    branches: [{
      id: 'examine_success',
      name: 'Examine Successfully',
      conditions: [],
      effects: [{ type: 'knowledge', value: 10 }]
    }],
    effects: [],
    context: { targetType: 'environment' }
  });

  // Movement interaction
  systemInteractions.push({
    id: 'movement_interaction',
    name: 'Move',
    type: 'movement',
    requirements: { energy: 15 },
    branches: [{
      id: 'movement_success',
      name: 'Move Successfully',
      conditions: [],
      effects: [{ type: 'position', value: 'changed' }]
    }],
    effects: [],
    context: { distance: 1 }
  });

  // Perception interaction
  systemInteractions.push({
    id: 'perception_interaction',
    name: 'Perceive',
    type: 'perception',
    requirements: { energy: 10 },
    branches: [{
      id: 'perception_success',
      name: 'Perceive Successfully',
      conditions: [],
      effects: [{ type: 'awareness', value: 15 }]
    }],
    effects: [],
    context: { range: 10 }
  });

  return systemInteractions;
}

/**
 * Valley of Echoes Demo Orchestrator
 */
class ValleyOfEchoesDemo {
  constructor() {
    this.worldBuilder = new WorldBuilder();
    this.lodManager = new LODManager();
    this.historyGenerator = new HistoryGenerator();
    this.worldState = null;
    this.demoResults = {
      turns: 0,
      events: [],
      performance: [],
      quests: [],
      settlements: []
    };
  }

  /**
   * Initialize the demo world
   */
  async initializeDemo() {
    console.log('🌍 Initializing Valley of Echoes Demo...');

    try {
      // Build Oakwood Federation
      console.log('🏛️ Building Oakwood Federation...');
      const oakwoodWorld = await this.buildSettlement(oakwoodFederationConfig);

      // Build Ironhold Dominion
      console.log('🏰 Building Ironhold Dominion...');
      const ironholdWorld = await this.buildSettlement(ironholdDominionConfig);

      // Merge settlements into unified world
      console.log('🔗 Merging settlements into unified world...');
      this.worldState = await this.mergeSettlements(oakwoodWorld, ironholdWorld);

      // Initialize quests
      console.log('📜 Initializing multi-settlement quests...');
      this.initializeQuests();

      console.log('✅ Demo world initialized successfully!');
      console.log(`   Settlements: ${this.worldState.settlements.length}`);
      console.log(`   Characters: ${this.worldState.characters.length}`);
      console.log(`   Nodes: ${this.worldState.nodes.length}`);
      console.log(`   Quests: ${multiSettlementQuests.length}`);

    } catch (error) {
      console.error('❌ Failed to initialize demo:', error);
      throw error;
    }
  }

  /**
   * Build a single settlement
   */
  async buildSettlement(config) {
    // Calculate total population from population groups
    const totalPopulation = config.populationGroups?.reduce((sum, group) => 
      sum + (group.size || group.count || 0), 0
    ) || 100;

    const settlement = {
      id: config.id,
      name: config.name,
      description: config.description,
      type: config.type,
      governance: config.governance,
      // Ensure proper population structure
      population: {
        total: totalPopulation,
        groups: config.populationGroups || [],
        breakdown: {
          farmers: config.populationGroups?.find(g => g.demographics?.occupation === 'farmer')?.size || 0,
          artisans: config.populationGroups?.find(g => g.demographics?.occupation === 'artisan')?.size || 0,
          merchants: config.populationGroups?.find(g => g.demographics?.occupation === 'merchant')?.size || 0,
          soldiers: 0,
          administrators: config.populationGroups?.find(g => g.demographics?.occupation === 'administrator')?.size || 0
        },
        lastUpdated: 0
      },
      nodes: config.nodes,
      assignedCharacters: [
        ...config.heroCharacters.map(char => char.id),
        ...config.populationGroups.flatMap(group =>
          Array.from({ length: group.size }, (_, i) => `${group.id}-bg-${i}`)
        )
      ],
      needSatisfaction: config.needSatisfaction,
      development: config.development,
      economy: config.economy
    };

    // Create hero characters
    const heroCharacters = config.heroCharacters.map(char => ({
      ...char,
      lodTier: 'hero',
      assignments: {
        nodes: new Set([char.assignedNode || char.assignments?.nodes?.values().next().value]),
        interactions: new Set(),
        settlements: new Set([config.id])
      }
    }));

    // Create group-level characters for population groups
    const groupCharacters = config.populationGroups.map(group => ({
      id: group.id,
      name: group.name,
      lodTier: 'group',
      populationGroupId: group.id,
      groupStatistics: group.statistics,
      assignments: {
        nodes: new Set([group.assignedNode]),
        interactions: new Set(),
        settlements: new Set([config.id])
      }
    }));

    // Create individual background characters for each population group
    const backgroundCharacters = [];
    config.populationGroups.forEach(group => {
      for (let i = 0; i < group.size; i++) {
        backgroundCharacters.push({
          id: `${group.id}-bg-${i}`,
          name: `${group.name} ${i + 1}`,
          lodTier: 'background',
          populationGroupId: group.id,
          demographicData: {
            occupation: group.demographics.occupation,
            ageGroup: group.demographics.ageGroup,
            economicClass: group.demographics.economicClass
          },
          assignments: {
            nodes: new Set([group.assignedNode]),
            interactions: new Set(),
            settlements: new Set([config.id])
          }
        });
      }
    });

    const worldData = {
      settlement: settlement,
      characters: [
        ...heroCharacters,
        ...groupCharacters,
        ...backgroundCharacters
      ],
      nodes: config.nodes,
      interactions: createSystemInteractions() // Add system interactions
    };

    return worldData;
  }

  /**
   * Assign interactions to characters based on their level and type
   * @param {Array} characters - Array of character objects
   * @param {Array} interactions - Array of available interactions
   * @returns {Array} Characters with assigned interactions
   */
  assignInteractionsToCharacters(characters, interactions) {
    console.log('🎯 Assigning interactions to characters...');

    if (!interactions || interactions.length === 0) {
      console.warn('⚠️ No interactions available to assign');
      return characters;
    }

    return characters.map(character => {
      // Skip if character already has interaction assignments
      if (character.assignments?.interactions?.size > 0) {
        console.log(`Character ${character.name} already has ${character.assignments.interactions.size} interaction assignments`);
        return character;
      }

      // Initialize assignments.interactions if it doesn't exist
      if (!character.assignments) {
        character.assignments = {
          nodes: new Set(),
          interactions: new Set(),
          quests: new Set(),
          settlements: new Set(),
          factions: new Set(),
          investments: new Set()
        };
      }

      // Ensure assignments.interactions is a Set
      if (!character.assignments.interactions) {
        character.assignments.interactions = new Set();
      } else if (Array.isArray(character.assignments.interactions)) {
        character.assignments.interactions = new Set(character.assignments.interactions);
      }

      // Determine how many interactions to assign (1-3 based on character level/type)
      const maxAssignments = Math.min(3, Math.max(1, Math.floor(character.level / 2) || 1));
      const numToAssign = Math.min(maxAssignments, interactions.length);

      // Randomly select interactions to assign
      const shuffled = [...interactions].sort(() => 0.5 - Math.random());
      const selectedInteractions = shuffled.slice(0, numToAssign);

      // Assign interactions to character
      selectedInteractions.forEach(interaction => {
        character.assignments.interactions.add(interaction.id);
      });

      console.log(`Assigned ${selectedInteractions.length} interactions to character ${character.name}:`,
        selectedInteractions.map(i => i.name).join(', '));

      return character;
    });
  }

  /**
   * Merge two settlement worlds into one
   */
  async mergeSettlements(settlementA, settlementB) {
    const mergedInteractions = [...(settlementA.interactions || []), ...(settlementB.interactions || [])];
    const mergedCharacters = [...settlementA.characters, ...settlementB.characters];

    // Assign interactions to characters
    const charactersWithInteractions = this.assignInteractionsToCharacters(mergedCharacters, mergedInteractions);

    return {
      turn: 0,
      events: [],
      settlements: [settlementA.settlement, settlementB.settlement],
      characters: charactersWithInteractions,
      nodes: [...settlementA.nodes, ...settlementB.nodes],
      interactions: mergedInteractions,
      relationships: {
        ...oakwoodFederationConfig.relationships,
        ...ironholdDominionConfig.relationships
      }
    };
  }

  /**
   * Initialize multi-settlement quests
   */
  initializeQuests() {
    this.demoResults.quests = multiSettlementQuests.map(quest => ({
      ...quest,
      status: 'active',
      progress: 0,
      startedAt: this.worldState.turn
    }));
  }

  /**
   * Run the demo for specified number of turns
   */
  async runDemo(turns = 25) {
    console.log(`🎮 Running Valley of Echoes Demo for ${turns} turns...`);

    for (let turn = 1; turn <= turns; turn++) {
      console.log(`\n📊 Turn ${turn}/${turns}`);
      const turnStart = performance.now();

      try {
        // Process turn with LOD integration
        const result = await processTurnWithLOD(
          this.worldState,
          this.lodManager,
          this.historyGenerator
        );

        // Update world state
        this.worldState = result.worldState;

        // Record results
        const turnTime = performance.now() - turnStart;
        this.recordTurnResults(turn, result, turnTime);

        // Update quests
        this.updateQuests();

        // Progress reporting
        if (turn % 5 === 0 || turn === turns) {
          this.reportProgress(turn, turns);
        }

      } catch (error) {
        console.error(`❌ Error in turn ${turn}:`, error);
        break;
      }
    }

    console.log('\n🎉 Demo completed!');
    this.generateFinalReport();
  }

  /**
   * Record turn results
   */
  recordTurnResults(turn, result, turnTime) {
    this.demoResults.turns = turn;
    this.demoResults.events.push(...result.turnResults.characterEvents);
    this.demoResults.events.push(...result.turnResults.settlementEvents);
    this.demoResults.events.push(...result.turnResults.crossSettlementEvents);

    this.demoResults.performance.push({
      turn,
      totalTime: result.turnResults.processingTime,
      lodTime: result.turnResults.lodResults.preTurn?.processingTime +
               result.turnResults.lodResults.postTurn?.processingTime,
      characterEvents: result.turnResults.characterEvents.length,
      settlementEvents: result.turnResults.settlementEvents.length,
      crossSettlementEvents: result.turnResults.crossSettlementEvents.length
    });

    // Record settlement states
    this.worldState.settlements.forEach(settlement => {
      this.demoResults.settlements.push({
        turn,
        settlementId: settlement.id,
        needSatisfaction: settlement.needSatisfaction?.current?.overall || 0,
        wealth: settlement.economy?.wealth || 0,
        population: settlement.assignedCharacters?.length || 0
      });
    });
  }

  /**
   * Update quest progress
   */
  updateQuests() {
    // Simple quest progress simulation
    // In a full implementation, this would check actual game state
    this.demoResults.quests.forEach(quest => {
      if (quest.status === 'active' && Math.random() < 0.3) { // 30% chance per turn
        quest.progress += Math.floor(Math.random() * 25) + 5;
        if (quest.progress >= 100) {
          quest.status = 'completed';
          quest.completedAt = this.worldState.turn;
        }
      }
    });
  }

  /**
   * Report progress every 5 turns
   */
  reportProgress(currentTurn, totalTurns) {
    const progress = (currentTurn / totalTurns) * 100;
    const completedQuests = this.demoResults.quests.filter(q => q.status === 'completed').length;
    const totalEvents = this.demoResults.events.length;

    console.log(`📈 Progress: ${progress.toFixed(1)}% (${currentTurn}/${totalTurns} turns)`);
    console.log(`   Events: ${totalEvents}`);
    console.log(`   Completed Quests: ${completedQuests}/${this.demoResults.quests.length}`);

    // LOD status
    const characters = this.worldState.characters;
    const heroCount = characters.filter(c => c.lodTier === 'hero').length;
    const groupCount = characters.filter(c => c.lodTier === 'group').length;
    const backgroundCount = characters.filter(c => c.lodTier === 'background').length;

    console.log(`   LOD: ${heroCount}H / ${groupCount}G / ${backgroundCount}B`);

    // Performance
    const recentPerf = this.demoResults.performance.slice(-5);
    if (recentPerf.length > 0) {
      const avgTime = recentPerf.reduce((sum, p) => sum + p.totalTime, 0) / recentPerf.length;
      console.log(`   Avg Turn Time: ${avgTime.toFixed(2)}ms`);
    }
  }

  /**
   * Generate final demo report
   */
  generateFinalReport() {
    console.log('\n📊 Valley of Echoes Demo - Final Report');
    console.log('='.repeat(50));

    // Performance Summary
    const totalTime = this.demoResults.performance.reduce((sum, p) => sum + p.totalTime, 0);
    const avgTurnTime = totalTime / this.demoResults.turns;
    const maxTurnTime = Math.max(...this.demoResults.performance.map(p => p.totalTime));

    console.log('🎯 Performance:');
    console.log(`   Total Turns: ${this.demoResults.turns}`);
    console.log(`   Total Time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   Average Turn: ${avgTurnTime.toFixed(2)}ms`);
    console.log(`   Max Turn: ${maxTurnTime.toFixed(2)}ms`);
    console.log(`   Target Met: ${avgTurnTime < 2000 ? '✅' : '❌'} (<2s per turn)`);

    // Event Summary
    const eventTypes = {};
    this.demoResults.events.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });

    console.log('\n📝 Events Generated:');
    Object.entries(eventTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

    // Quest Summary
    const completedQuests = this.demoResults.quests.filter(q => q.status === 'completed');
    console.log('\n🏆 Quest Completion:');
    console.log(`   Completed: ${completedQuests.length}/${this.demoResults.quests.length}`);
    completedQuests.forEach(quest => {
      console.log(`   ✅ ${quest.title} (Turn ${quest.completedAt})`);
    });

    // Settlement Summary
    console.log('\n🏛️ Final Settlement States:');
    const finalStates = {};
    this.demoResults.settlements
      .filter(s => s.turn === this.demoResults.turns)
      .forEach(state => {
        finalStates[state.settlementId] = state;
      });

    Object.values(finalStates).forEach(state => {
      console.log(`   ${state.settlementId}:`);
      console.log(`     Satisfaction: ${(state.needSatisfaction * 100).toFixed(1)}%`);
      console.log(`     Population: ${state.population}`);
    });

    // LOD Final State
    const finalCharacters = this.worldState.characters;
    const finalLOD = {
      hero: finalCharacters.filter(c => c.lodTier === 'hero').length,
      group: finalCharacters.filter(c => c.lodTier === 'group').length,
      background: finalCharacters.filter(c => c.lodTier === 'background').length
    };

    console.log('\n🎯 Final LOD Distribution:');
    console.log(`   Hero NPCs: ${finalLOD.hero}`);
    console.log(`   Population Groups: ${finalLOD.group}`);
    console.log(`   Background: ${finalLOD.background}`);

    console.log('\n🎉 Valley of Echoes Demo Complete!');
  }

  /**
   * Get demo results
   */
  getResults() {
    return {
      ...this.demoResults,
      worldState: this.worldState
    };
  }
}

/**
 * Run the Valley of Echoes demo
 */
async function runValleyOfEchoesDemo(turns = 25) {
  const demo = new ValleyOfEchoesDemo();

  try {
    await demo.initializeDemo();
    await demo.runDemo(turns);
    return demo.getResults();
  } catch (error) {
    console.error('Demo failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  const turns = parseInt(process.argv[2]) || 25;
  runValleyOfEchoesDemo(turns).catch(console.error);
}

module.exports = { ValleyOfEchoesDemo, runValleyOfEchoesDemo };