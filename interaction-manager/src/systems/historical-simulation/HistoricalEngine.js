import TemplateManager from './TemplateManager';
import WorldGenerator from './WorldGenerator';
import SimulationEngine from './SimulationEngine';
import HistoryAnalyzer from './HistoryAnalyzer';

class WorldHistoryEngine {
  constructor() {
    this.templateManager = new TemplateManager();
    this.world = null;
    this.simulationEngine = null;
    this.historyAnalyzer = null;
  }

  // Initialize the engine
  async initialize(config) {
    // Load templates
    await this.loadTemplates(config.templates);

    // Generate initial world
    this.world = await this.generateWorld(config.world);

    // Initialize simulation engine
    this.simulationEngine = new SimulationEngine(this.world, this.templateManager);

    // Initialize history analyzer
    this.historyAnalyzer = new HistoryAnalyzer(this.world);

    return this;
  }

  // Load templates
  async loadTemplates(config) {
    const {
      characters,
      nodes,
      interactions,
      groups,
      historicalRecords
    } = config;

    // Load character templates
    if (characters) {
      characters.forEach(template => {
        this.templateManager.registerTemplate('characters', template);
      });
    }

    // Load node templates
    if (nodes) {
      nodes.forEach(template => {
        this.templateManager.registerTemplate('nodes', template);
      });
    }

    // Load interaction templates
    if (interactions) {
      interactions.forEach(template => {
        this.templateManager.registerTemplate('interactions', template);
      });
    }

    // Load group templates
    if (groups) {
      groups.forEach(template => {
        this.templateManager.registerTemplate('groups', template);
      });
    }

    // Load historical record templates
    if (historicalRecords) {
      historicalRecords.forEach(template => {
        this.templateManager.registerTemplate('historicalRecords', template);
      });
    }
  }

  // Generate world
  async generateWorld(config) {
    const generator = new WorldGenerator(this.templateManager);
    return await generator.generateWorld(config);
  }

  // Run simulation
  async simulate(config) {
    if (!this.simulationEngine) {
      throw new Error('Simulation engine not initialized');
    }

    return await this.simulationEngine.simulate(config);
  }

  // Query history
  queryHistory(query) {
    if (!this.historyAnalyzer) {
      throw new Error('History analyzer not initialized');
    }

    return this.historyAnalyzer.queryHistory(query);
  }

  // Generate family tree
  generateFamilyTree(rootId, options) {
    if (!this.historyAnalyzer) {
      throw new Error('History analyzer not initialized');
    }

    return this.historyAnalyzer.generateFamilyTree(rootId, options);
  }

  // Analyze NPC decisions
  analyzeDecisions(npcId, options) {
    if (!this.historyAnalyzer) {
      throw new Error('History analyzer not initialized');
    }

    return this.historyAnalyzer.analyzeDecisions(npcId, options);
  }

  // Export world state
  exportWorld() {
    return {
      world: this.world,
      templates: {
        characters: this.templateManager.exportTemplates('characters'),
        nodes: this.templateManager.exportTemplates('nodes'),
        interactions: this.templateManager.exportTemplates('interactions'),
        groups: this.templateManager.exportTemplates('groups'),
        historicalRecords: this.templateManager.exportTemplates('historicalRecords')
      }
    };
  }

  // Import world state
  async importWorld(state) {
    // Load templates
    await this.loadTemplates(state.templates);

    // Set world state
    this.world = state.world;

    // Reinitialize engines
    this.simulationEngine = new SimulationEngine(this.world, this.templateManager);
    this.historyAnalyzer = new HistoryAnalyzer(this.world);

    return this;
  }

  // Save world to localStorage
  saveWorld() {
    const state = this.exportWorld();
    localStorage.setItem('worldHistoryState', JSON.stringify(state));
  }

  // Load world from localStorage
  async loadWorld() {
    const state = JSON.parse(localStorage.getItem('worldHistoryState'));
    if (state) {
      await this.importWorld(state);
    }
    return this;
  }

  // Example usage
  static async createExampleWorld() {
    const engine = new WorldHistoryEngine();
    
    // Example configuration
    const config = {
      templates: {
        characters: [
          {
            id: 'noble',
            name: 'Noble',
            description: 'A noble character template',
            baseTraits: {
              ambition: 0.8,
              honor: 0.7,
              loyalty: 0.6
            },
            attributeDistribution: {
              strength: { min: 8, max: 16, weight: 1 },
              dexterity: { min: 8, max: 16, weight: 1 },
              constitution: { min: 8, max: 16, weight: 1 },
              intelligence: { min: 10, max: 18, weight: 1.2 },
              wisdom: { min: 10, max: 18, weight: 1.2 },
              charisma: { min: 12, max: 20, weight: 1.5 }
            },
            skillDistribution: {
              diplomacy: { attribute: 'charisma', weight: 1.5 },
              history: { attribute: 'intelligence', weight: 1.2 },
              persuasion: { attribute: 'charisma', weight: 1.3 }
            },
            goalTypes: ['power', 'wealth', 'prestige'],
            behaviorPatterns: [
              {
                name: 'political_maneuvering',
                conditions: { hasPower: true },
                actions: ['form_alliance', 'undermine_rival'],
                priority: 1
              }
            ]
          }
        ],
        nodes: [
          {
            id: 'castle',
            name: 'Castle',
            description: 'A fortified castle',
            baseFeatures: [
              {
                name: 'fortification',
                description: 'Strong defensive walls',
                effects: {
                  defense: 10,
                  populationCapacity: 1000
                }
              }
            ],
            resourcePotential: {
              resources: {
                gold: 1000,
                food: 500,
                wood: 200
              },
              distribution: {
                gold: 0.8,
                food: 0.6,
                wood: 0.4
              }
            }
          }
        ]
      },
      world: {
        size: { width: 1000, height: 1000 },
        nodeCount: 100,
        resourceTypes: ['gold', 'food', 'wood', 'stone', 'iron'],
        initialPopulation: 1000,
        simulationYears: 100,
        useExistingQuests: true,
        attributeGeneration: 'dice_roll',
        consciousnessEnabled: true
      }
    };

    // Initialize engine with config
    await engine.initialize(config);

    // Run simulation
    await engine.simulate({
      years: 100,
      timeStep: 1,
      eventFrequency: 5,
      maxConcurrentEvents: 10,
      enableLogging: true
    });

    return engine;
  }
}

export default WorldHistoryEngine; 