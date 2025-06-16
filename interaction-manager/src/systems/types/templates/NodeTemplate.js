export class NodeTemplate {
  constructor(id, name, type = 'location') {
    this.id = id;
    this.name = name;
    this.type = type;
    this.connections = new Map();
    this.resources = new Map();
    this.events = new Map();
  }
} 