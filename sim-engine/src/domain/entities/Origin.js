/**
 * Origin - Character origin/backstory template
 * 
 * Defines starting conditions, key backstory events, and initial state
 * for character creation. Can be used for:
 * - Pre-game origin stories
 * - Fast-forward character backstory
 * - Different starting conditions/difficulties
 */

import { v4 as uuidv4 } from 'uuid';

class Origin {
  constructor(config = {}) {
    this.id = config.id || `origin_${uuidv4()}`;
    this.name = config.name || 'Unknown Origin';
    this.description = config.description || '';
    this.category = config.category || 'custom'; // 'noble', 'commoner', 'warrior', 'scholar', etc.
    
    // Age configuration
    this.startAge = config.startAge || 0;
    this.playableAge = config.playableAge || 18;
    this.currentAge = config.currentAge || this.startAge;
    
    // Starting location
    this.startWorldId = config.startWorldId || null;
    this.startNodeId = config.startNodeId || null;
    
    // Initial character attributes
    this.initialAttributes = config.initialAttributes || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    };
    
    // Initial skills/proficiencies
    this.initialSkills = config.initialSkills || {};
    
    // Initial inventory/equipment
    this.initialInventory = config.initialInventory || [];
    
    // Initial relationships
    this.initialRelationships = config.initialRelationships || [];
    
    // Personality traits influenced by origin
    this.personalityModifiers = config.personalityModifiers || {};
    
    // Key backstory events (shown during origin simulation)
    this.backstoryEvents = config.backstoryEvents || [];
    
    // Simulation speed for backstory (years per second)
    this.backstorySpeed = config.backstorySpeed || 10.0;
    
    // Events that trigger cutscenes/notifications
    this.significantEvents = config.significantEvents || [];
    
    // Tags for filtering/searching
    this.tags = config.tags || [];
    
    // Difficulty/complexity
    this.difficulty = config.difficulty || 'normal'; // 'easy', 'normal', 'hard', 'expert'
    
    // Metadata
    this.metadata = {
      createdAt: config.metadata?.createdAt || Date.now(),
      lastModified: config.metadata?.lastModified || Date.now(),
      version: config.metadata?.version || '1.0.0',
      author: config.metadata?.author || 'system',
      isTemplate: config.metadata?.isTemplate || false
    };
  }

  /**
   * Adds a backstory event
   * @param {Object} event - Event configuration
   * @param {number} event.age - Age when event occurs
   * @param {string} event.type - Event type (birth, death, training, etc.)
   * @param {string} event.description - Event description
   * @param {boolean} event.isSignificant - Show to player?
   * @param {Object} event.effects - Effects on character
   */
  addBackstoryEvent(event) {
    if (!event.age || event.age < this.startAge || event.age > this.playableAge) {
      throw new Error(`Event age must be between ${this.startAge} and ${this.playableAge}`);
    }

    const backstoryEvent = {
      id: `event_${uuidv4()}`,
      age: event.age,
      type: event.type || 'generic',
      description: event.description || '',
      isSignificant: event.isSignificant || false,
      effects: event.effects || {}
    };

    this.backstoryEvents.push(backstoryEvent);
    this.backstoryEvents.sort((a, b) => a.age - b.age);

    if (backstoryEvent.isSignificant) {
      this.significantEvents.push(backstoryEvent.id);
    }

    return backstoryEvent;
  }

  /**
   * Gets events for a specific age
   * @param {number} age - Character age
   * @returns {Array} Events at this age
   */
  getEventsAtAge(age) {
    return this.backstoryEvents.filter(e => e.age === age);
  }

  /**
   * Gets all significant events
   * @returns {Array} Events marked as significant
   */
  getSignificantEvents() {
    return this.backstoryEvents.filter(e => e.isSignificant);
  }

  /**
   * Applies origin effects to a character
   * @param {Character} character - Character to modify
   */
  applyToCharacter(character) {
    // Apply initial attributes
    Object.assign(character.attributes, this.initialAttributes);

    // Apply skills
    Object.entries(this.initialSkills).forEach(([skill, value]) => {
      character.skills[skill] = value;
    });

    // Apply personality modifiers
    Object.entries(this.personalityModifiers).forEach(([trait, modifier]) => {
      const existing = character.personality.traits.find(t => t.id === trait);
      if (existing) {
        existing.intensity = Math.max(0, Math.min(1, existing.intensity + modifier));
      } else {
        character.personality.traits.push({ id: trait, intensity: modifier });
      }
    });

    // Set initial age
    character.age = this.currentAge;

    // Apply inventory
    if (character.inventory) {
      character.inventory.push(...this.initialInventory);
    }

    return character;
  }

  /**
   * Validates origin configuration
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Origin name is required');
    }

    if (this.startAge < 0) {
      errors.push('Start age cannot be negative');
    }

    if (this.playableAge <= this.startAge) {
      errors.push('Playable age must be greater than start age');
    }

    if (this.backstoryEvents.length === 0) {
      warnings.push('No backstory events defined');
    }

    if (!this.startWorldId) {
      warnings.push('No starting world specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Converts to JSON for serialization
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      startAge: this.startAge,
      playableAge: this.playableAge,
      currentAge: this.currentAge,
      startWorldId: this.startWorldId,
      startNodeId: this.startNodeId,
      initialAttributes: { ...this.initialAttributes },
      initialSkills: { ...this.initialSkills },
      initialInventory: [...this.initialInventory],
      initialRelationships: [...this.initialRelationships],
      personalityModifiers: { ...this.personalityModifiers },
      backstoryEvents: [...this.backstoryEvents],
      backstorySpeed: this.backstorySpeed,
      significantEvents: [...this.significantEvents],
      tags: [...this.tags],
      difficulty: this.difficulty,
      metadata: { ...this.metadata }
    };
  }

  /**
   * Creates Origin from JSON
   * @param {Object} json - JSON data
   * @returns {Origin} Origin instance
   */
  static fromJSON(json) {
    return new Origin(json);
  }

  /**
   * Creates a copy of this origin
   * @param {string} newName - Name for the copy
   * @returns {Origin} Copied origin
   */
  clone(newName = null) {
    const data = this.toJSON();
    data.id = `origin_${uuidv4()}`;
    data.name = newName || `${this.name} (Copy)`;
    data.metadata.createdAt = Date.now();
    data.metadata.lastModified = Date.now();
    return new Origin(data);
  }
}

export default Origin;
