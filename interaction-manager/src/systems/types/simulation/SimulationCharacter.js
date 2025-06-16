export class SimulationCharacter {
  constructor(id, name, traits = {}) {
    this.id = id;
    this.name = name;
    this.traits = traits;
    this.relationships = new Map();
    this.inventory = new Map();
    this.quests = new Map();
    this.state = {
      health: 100,
      energy: 100,
      mood: 50
    };
  }
} 