export class Settlement {
  constructor(id, name, type = 'village') {
    this.id = id;
    this.name = name;
    this.type = type;
    this.population = 0;
    this.resources = new Map();
    this.buildings = new Map();
    this.factions = new Map();
  }
} 