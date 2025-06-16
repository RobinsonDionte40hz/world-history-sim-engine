export class GroupTemplate {
  constructor(id, name, type = 'faction') {
    this.id = id;
    this.name = name;
    this.type = type;
    this.members = new Map();
    this.goals = new Map();
    this.resources = new Map();
  }
} 