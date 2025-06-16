export class CharacterTemplate {
  constructor(id, name, description = '') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.personalityTraits = new Map();
    this.skills = new Map();
    this.relationships = new Map();
  }
} 