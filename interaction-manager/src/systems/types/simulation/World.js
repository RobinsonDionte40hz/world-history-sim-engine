export class World {
  constructor() {
    this.nodes = new Map();
    this.characters = new Map();
    this.groups = new Map();
    this.history = [];
    this.currentTime = 0;
  }
} 