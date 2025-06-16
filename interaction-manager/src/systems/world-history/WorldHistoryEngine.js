import { SimulationEngine } from '../simulation/SimulationEngine';
import { TemplateManager } from '../template/TemplateManager';
import { WorldGenerator } from './WorldGenerator';
import { World } from '../types/simulation/World';

class WorldHistoryEngine {
  constructor() {
    this.templateManager = new TemplateManager();
    this.worldGenerator = new WorldGenerator();
    this.simulationEngine = new SimulationEngine();
    this.world = null;
  }

  async initialize(config = {}) {
    // Load templates if provided
    if (config.templates) {
      await this.loadTemplates(config.templates);
    }

    // Initialize simulation engine with empty world
    this.world = new World();
    this.simulationEngine.initialize(this.world);
  }

  async loadTemplates(templates) {
    // Load character templates
    if (templates.characters) {
      for (const template of templates.characters) {
        await this.templateManager.registerTemplate('character', template);
      }
    }

    // Load node templates
    if (templates.nodes) {
      for (const template of templates.nodes) {
        await this.templateManager.registerTemplate('node', template);
      }
    }

    // Load group templates
    if (templates.groups) {
      for (const template of templates.groups) {
        await this.templateManager.registerTemplate('group', template);
      }
    }
  }

  async generateWorld() {
    // Generate a new world using the world generator
    this.world = await this.worldGenerator.generate();
    
    // Initialize simulation engine with the new world
    this.simulationEngine.initialize(this.world);
    
    return this.world;
  }

  startSimulation() {
    this.simulationEngine.start();
  }

  stopSimulation() {
    this.simulationEngine.stop();
  }

  getWorldState() {
    return this.simulationEngine.getWorldState();
  }
}

export default WorldHistoryEngine; 