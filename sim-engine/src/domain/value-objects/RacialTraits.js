// src/domain/value-objects/RacialTraits.js

/**
 * Immutable value object representing a character's racial traits and modifiers
 * Provides racial bonuses, features, and lifespan information for character generation
 */
export class RacialTraits {
  constructor(raceId, subraceId = null, customModifiers = {}) {
    // Validate inputs
    if (!raceId || typeof raceId !== 'string') {
      throw new Error('Race ID is required and must be a string');
    }

    // Get race data from the static race definitions
    const raceData = RacialTraits._getRaceData(raceId);
    if (!raceData) {
      throw new Error(`Race with ID '${raceId}' not found`);
    }

    // Get subrace data if specified
    let subraceData = null;
    if (subraceId) {
      subraceData = raceData.subraces.find(s => s.name === subraceId);
      if (!subraceData) {
        throw new Error(`Subrace '${subraceId}' not found in race '${raceId}'`);
      }
    }

    // Store immutable race information
    this._raceId = raceId;
    this._subraceId = subraceId;
    this._race = Object.freeze({ ...raceData });
    this._subrace = subraceData ? Object.freeze({ ...subraceData }) : null;
    
    // Calculate and freeze modifiers
    this._attributeModifiers = Object.freeze(this._calculateAttributeModifiers(customModifiers.attributes));
    this._skillModifiers = Object.freeze(this._calculateSkillModifiers(customModifiers.skills));
    this._features = Object.freeze(this._calculateFeatures());
    this._lifespan = Object.freeze(this._calculateLifespan());
    
    // Make the entire object immutable
    Object.freeze(this);
  }

  /**
   * Get the race ID
   */
  get raceId() {
    return this._raceId;
  }

  /**
   * Get the subrace ID (if any)
   */
  get subraceId() {
    return this._subraceId;
  }

  /**
   * Get the race data
   */
  get race() {
    return this._race;
  }

  /**
   * Get the subrace data (if any)
   */
  get subrace() {
    return this._subrace;
  }

  /**
   * Get attribute modifiers as a Map
   */
  getAttributeModifiers() {
    return new Map(Object.entries(this._attributeModifiers));
  }

  /**
   * Get skill modifiers as a Map
   */
  getSkillModifiers() {
    return new Map(Object.entries(this._skillModifiers));
  }

  /**
   * Get lifespan information
   */
  getLifespan() {
    return Object.freeze({ ...this._lifespan });
  }

  /**
   * Get racial features array
   */
  getFeatures() {
    return Object.freeze([...this._features]);
  }

  /**
   * Get a specific attribute modifier value
   */
  getAttributeModifier(attributeName) {
    return this._attributeModifiers[attributeName] || 0;
  }

  /**
   * Get a specific skill modifier value
   */
  getSkillModifier(skillName) {
    return this._skillModifiers[skillName] || 0;
  }

  /**
   * Check if the character has a specific racial feature
   */
  hasFeature(featureName) {
    return this._features.includes(featureName);
  }

  /**
   * Apply racial attribute modifiers to a character's base attributes
   */
  applyAttributeModifiers(baseAttributes) {
    if (!baseAttributes || typeof baseAttributes !== 'object') {
      throw new Error('Base attributes must be provided as an object');
    }

    const modifiedAttributes = { ...baseAttributes };
    
    // Apply each racial attribute modifier
    Object.entries(this._attributeModifiers).forEach(([attribute, modifier]) => {
      if (typeof modifier === 'number') {
        modifiedAttributes[attribute] = (modifiedAttributes[attribute] || 0) + modifier;
      }
    });

    return modifiedAttributes;
  }

  /**
   * Apply racial skill modifiers to a character's base skills
   */
  applySkillModifiers(baseSkills) {
    if (!baseSkills || typeof baseSkills !== 'object') {
      throw new Error('Base skills must be provided as an object');
    }

    const modifiedSkills = { ...baseSkills };
    
    // Apply each racial skill modifier
    Object.entries(this._skillModifiers).forEach(([skill, modifier]) => {
      if (typeof modifier === 'number') {
        modifiedSkills[skill] = (modifiedSkills[skill] || 0) + modifier;
      }
    });

    return modifiedSkills;
  }

  /**
   * Apply racial bonuses to character attributes using Map interface
   */
  applyAttributeBonuses(attributeMap) {
    if (!(attributeMap instanceof Map)) {
      throw new Error('Attribute map must be a Map instance');
    }

    const newAttributeMap = new Map(attributeMap);
    
    // Apply racial attribute modifiers
    Object.entries(this._attributeModifiers).forEach(([attribute, modifier]) => {
      if (typeof modifier === 'number') {
        const currentValue = newAttributeMap.get(attribute) || 0;
        newAttributeMap.set(attribute, currentValue + modifier);
      }
    });

    return newAttributeMap;
  }

  /**
   * Apply racial bonuses to character skills using Map interface
   */
  applySkillBonuses(skillMap) {
    if (!(skillMap instanceof Map)) {
      throw new Error('Skill map must be a Map instance');
    }

    const newSkillMap = new Map(skillMap);
    
    // Apply racial skill modifiers
    Object.entries(this._skillModifiers).forEach(([skill, modifier]) => {
      if (typeof modifier === 'number') {
        const currentValue = newSkillMap.get(skill) || 0;
        newSkillMap.set(skill, currentValue + modifier);
      }
    });

    return newSkillMap;
  }

  /**
   * Get racial influence on personality traits
   * Returns suggested personality trait modifiers based on racial characteristics
   */
  getPersonalityInfluence() {
    const influence = {};

    // Apply race-specific personality influences
    switch (this._raceId) {
      case 'human':
        influence.adaptability = 0.1;
        influence.ambition = 0.1;
        influence.curiosity = 0.05;
        break;
      
      case 'elf':
        influence.wisdom = 0.15;
        influence.patience = 0.2;
        influence.artistic = 0.1;
        if (this._subraceId === 'High Elf') {
          influence.intelligence = 0.1;
          influence.scholarly = 0.15;
        } else if (this._subraceId === 'Wood Elf') {
          influence.nature_affinity = 0.2;
          influence.independence = 0.1;
        }
        break;
      
      case 'dwarf':
        influence.determination = 0.15;
        influence.loyalty = 0.2;
        influence.craftsmanship = 0.15;
        influence.stubbornness = 0.1;
        if (this._subraceId === 'Mountain Dwarf') {
          influence.resilience = 0.1;
          influence.strength_focus = 0.1;
        } else if (this._subraceId === 'Hill Dwarf') {
          influence.wisdom = 0.1;
          influence.community_focus = 0.1;
        }
        break;
    }

    return Object.freeze(influence);
  }

  /**
   * Get racial influence on alignment tendencies
   * Returns suggested alignment modifiers based on racial characteristics
   */
  getAlignmentInfluence() {
    const influence = {};

    // Apply race-specific alignment influences
    switch (this._raceId) {
      case 'human':
        // Humans are neutral - no strong alignment tendencies
        influence.neutrality = 0.05;
        break;
      
      case 'elf':
        influence.good = 0.1;
        influence.chaotic = 0.05; // Elves tend toward freedom
        if (this._subraceId === 'High Elf') {
          influence.lawful = 0.1; // High elves are more structured
        } else if (this._subraceId === 'Wood Elf') {
          influence.chaotic = 0.15; // Wood elves value freedom more
          influence.neutral = 0.1; // Connection to nature
        }
        break;
      
      case 'dwarf':
        influence.lawful = 0.15; // Dwarves value tradition and order
        influence.good = 0.1; // Generally community-minded
        if (this._subraceId === 'Mountain Dwarf') {
          influence.lawful = 0.2; // Even more structured
        }
        break;
    }

    return Object.freeze(influence);
  }

  /**
   * Apply racial features to character capabilities
   * Returns an object describing how racial features affect character abilities
   */
  applyRacialFeatures(characterCapabilities = {}) {
    const enhancedCapabilities = { ...characterCapabilities };

    // Apply feature-based enhancements
    this._features.forEach(feature => {
      switch (feature) {
        case 'Versatile':
          enhancedCapabilities.skillLearningRate = (enhancedCapabilities.skillLearningRate || 1.0) * 1.1;
          break;
        
        case 'Ambitious':
          enhancedCapabilities.goalPursuitBonus = (enhancedCapabilities.goalPursuitBonus || 0) + 0.1;
          break;
        
        case 'Arcane Affinity':
          enhancedCapabilities.magicLearningRate = (enhancedCapabilities.magicLearningRate || 1.0) * 1.3;
          enhancedCapabilities.magicResistance = (enhancedCapabilities.magicResistance || 1.0) * 1.2;
          break;
        
        case 'Long-lived':
          enhancedCapabilities.experienceRetention = (enhancedCapabilities.experienceRetention || 1.0) * 1.2;
          break;
        
        case 'Nature Bond':
          enhancedCapabilities.natureSkillBonus = (enhancedCapabilities.natureSkillBonus || 0) + 2;
          break;
        
        case 'Agile':
          enhancedCapabilities.movementBonus = (enhancedCapabilities.movementBonus || 0) + 1;
          break;
        
        case 'Stonecunning':
          enhancedCapabilities.stoneWorkBonus = (enhancedCapabilities.stoneWorkBonus || 0) + 2;
          break;
        
        case 'Resilient':
          enhancedCapabilities.physicalResistance = (enhancedCapabilities.physicalResistance || 1.0) * 1.3;
          break;
        
        case 'Hardy':
          enhancedCapabilities.healthBonus = (enhancedCapabilities.healthBonus || 0) + 1;
          break;
        
        case 'Wise':
          enhancedCapabilities.wisdomBonus = (enhancedCapabilities.wisdomBonus || 0) + 1;
          break;
      }
    });

    // Apply trait effects
    const traitEffects = this.getTraitEffects();
    Object.entries(traitEffects).forEach(([effect, value]) => {
      enhancedCapabilities[effect] = value;
    });

    return enhancedCapabilities;
  }

  /**
   * Calculate age-related modifiers based on racial lifespan
   */
  calculateAgeModifiers(currentAge) {
    if (typeof currentAge !== 'number' || currentAge < 0) {
      throw new Error('Current age must be a non-negative number');
    }

    const lifespan = this.getLifespan();
    const ageRatio = currentAge / lifespan.average;
    const modifiers = {};

    // Different races age differently
    switch (this._raceId) {
      case 'human':
        if (ageRatio < 0.2) { // Young (0-16)
          modifiers.learning = 1.2;
          modifiers.physical = 0.8;
          modifiers.wisdom = 0.7;
        } else if (ageRatio < 0.6) { // Adult (16-48)
          modifiers.learning = 1.0;
          modifiers.physical = 1.0;
          modifiers.wisdom = 1.0;
        } else if (ageRatio < 0.8) { // Middle-aged (48-64)
          modifiers.learning = 0.9;
          modifiers.physical = 0.9;
          modifiers.wisdom = 1.2;
        } else { // Elder (64+)
          modifiers.learning = 0.8;
          modifiers.physical = 0.7;
          modifiers.wisdom = 1.4;
        }
        break;
      
      case 'elf':
        if (ageRatio < 0.1) { // Young elf (0-75)
          modifiers.learning = 1.3;
          modifiers.physical = 0.9;
          modifiers.wisdom = 0.8;
        } else if (ageRatio < 0.7) { // Adult elf (75-525)
          modifiers.learning = 1.1;
          modifiers.physical = 1.0;
          modifiers.wisdom = 1.1;
        } else { // Elder elf (525+)
          modifiers.learning = 1.0;
          modifiers.physical = 0.9;
          modifiers.wisdom = 1.5;
        }
        break;
      
      case 'dwarf':
        if (ageRatio < 0.15) { // Young dwarf (0-52)
          modifiers.learning = 1.1;
          modifiers.physical = 0.9;
          modifiers.wisdom = 0.8;
          modifiers.crafting = 0.7;
        } else if (ageRatio < 0.7) { // Adult dwarf (52-245)
          modifiers.learning = 1.0;
          modifiers.physical = 1.0;
          modifiers.wisdom = 1.0;
          modifiers.crafting = 1.2;
        } else { // Elder dwarf (245+)
          modifiers.learning = 0.9;
          modifiers.physical = 0.8;
          modifiers.wisdom = 1.3;
          modifiers.crafting = 1.4;
        }
        break;
    }

    return Object.freeze(modifiers);
  }

  /**
   * Get all racial trait effects
   */
  getTraitEffects() {
    const effects = {};
    
    // Combine race trait effects
    if (this._race.traits) {
      this._race.traits.forEach(trait => {
        Object.assign(effects, trait.effects || {});
      });
    }

    return Object.freeze(effects);
  }

  /**
   * Create a new RacialTraits instance with different subrace
   */
  withSubrace(newSubraceId) {
    return new RacialTraits(this._raceId, newSubraceId);
  }

  /**
   * Create a new RacialTraits instance with custom modifiers
   */
  withCustomModifiers(customModifiers) {
    return new RacialTraits(this._raceId, this._subraceId, customModifiers);
  }

  /**
   * Calculate total attribute modifiers from race and subrace
   */
  _calculateAttributeModifiers(customAttributes = {}) {
    const modifiers = { ...customAttributes };

    // Apply subrace modifiers first (more specific)
    if (this._subrace && this._subrace.attributeModifiers) {
      Object.entries(this._subrace.attributeModifiers).forEach(([attr, value]) => {
        modifiers[attr] = (modifiers[attr] || 0) + value;
      });
    }

    return modifiers;
  }

  /**
   * Calculate total skill modifiers from race and subrace
   */
  _calculateSkillModifiers(customSkills = {}) {
    const modifiers = { ...customSkills };

    // Apply subrace modifiers
    if (this._subrace && this._subrace.skillModifiers) {
      Object.entries(this._subrace.skillModifiers).forEach(([skill, value]) => {
        modifiers[skill] = (modifiers[skill] || 0) + value;
      });
    }

    return modifiers;
  }

  /**
   * Calculate all racial features
   */
  _calculateFeatures() {
    const features = [];

    // Add race-level features from traits
    if (this._race.traits) {
      this._race.traits.forEach(trait => {
        features.push(trait.name);
      });
    }

    // Add subrace features
    if (this._subrace && this._subrace.features) {
      features.push(...this._subrace.features);
    }

    return features;
  }

  /**
   * Calculate lifespan information
   */
  _calculateLifespan() {
    return {
      average: this._race.lifespan.average,
      maximum: this._race.lifespan.maximum
    };
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      raceId: this._raceId,
      subraceId: this._subraceId,
      attributeModifiers: { ...this._attributeModifiers },
      skillModifiers: { ...this._skillModifiers },
      features: [...this._features],
      lifespan: { ...this._lifespan }
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for RacialTraits');
    }

    // Create a new instance without custom modifiers to avoid double application
    // The JSON data already contains the calculated modifiers
    return new RacialTraits(data.raceId, data.subraceId);
  }

  /**
   * Create RacialTraits from the old RaceSystem format
   */
  static fromRaceSystem(raceId, subraceName = null) {
    return new RacialTraits(raceId, subraceName);
  }

  /**
   * Equality comparison
   */
  equals(other) {
    if (!(other instanceof RacialTraits)) return false;
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  /**
   * String representation
   */
  toString() {
    const subrace = this._subraceId ? ` (${this._subraceId})` : '';
    return `RacialTraits { ${this._race.name}${subrace} }`;
  }

  /**
   * Static method to get race data - this will be populated with race definitions
   */
  static _getRaceData(raceId) {
    return RacialTraits._raceDefinitions.get(raceId);
  }

  /**
   * Static race definitions - initialized below
   */
  static _raceDefinitions = new Map();

  /**
   * Initialize default race definitions
   */
  static _initializeRaces() {
    // Human
    RacialTraits._raceDefinitions.set('human', {
      id: 'human',
      name: 'Human',
      description: 'Versatile and adaptable, humans are known for their diversity and ambition.',
      subraces: [
        {
          name: 'Standard',
          description: 'The most common human variant',
          attributeModifiers: {
            versatility: 1
          },
          skillModifiers: {
            adaptability: 1
          },
          features: ['Versatile', 'Ambitious']
        }
      ],
      traits: [
        {
          name: 'Versatility',
          description: 'Humans can excel in any field they choose',
          effects: {
            skillGainRate: 1.1
          }
        }
      ],
      lifespan: {
        average: 80,
        maximum: 100
      }
    });

    // Elf
    RacialTraits._raceDefinitions.set('elf', {
      id: 'elf',
      name: 'Elf',
      description: 'Graceful and long-lived, elves are known for their wisdom and magical affinity.',
      subraces: [
        {
          name: 'High Elf',
          description: 'Scholarly and magical',
          attributeModifiers: {
            intelligence: 2,
            dexterity: 1
          },
          skillModifiers: {
            magic: 2,
            knowledge: 1
          },
          features: ['Arcane Affinity', 'Long-lived']
        },
        {
          name: 'Wood Elf',
          description: 'Nature-oriented and agile',
          attributeModifiers: {
            dexterity: 2,
            wisdom: 1
          },
          skillModifiers: {
            nature: 2,
            stealth: 1
          },
          features: ['Nature Bond', 'Agile']
        }
      ],
      traits: [
        {
          name: 'Longevity',
          description: 'Elves live for centuries',
          effects: {
            lifespan: 2.0
          }
        },
        {
          name: 'Magical Affinity',
          description: 'Natural talent for magic',
          effects: {
            magicResistance: 1.2,
            magicLearning: 1.3
          }
        }
      ],
      lifespan: {
        average: 750,
        maximum: 1000
      }
    });

    // Dwarf
    RacialTraits._raceDefinitions.set('dwarf', {
      id: 'dwarf',
      name: 'Dwarf',
      description: 'Sturdy and skilled craftsmen, dwarves are known for their resilience and craftsmanship.',
      subraces: [
        {
          name: 'Mountain Dwarf',
          description: 'Strong and resilient',
          attributeModifiers: {
            strength: 2,
            constitution: 2
          },
          skillModifiers: {
            crafting: 2,
            mining: 1
          },
          features: ['Stonecunning', 'Resilient']
        },
        {
          name: 'Hill Dwarf',
          description: 'Wise and hardy',
          attributeModifiers: {
            constitution: 2,
            wisdom: 1
          },
          skillModifiers: {
            crafting: 1,
            survival: 1
          },
          features: ['Hardy', 'Wise']
        }
      ],
      traits: [
        {
          name: 'Resilience',
          description: 'Dwarves are naturally resistant to physical harm',
          effects: {
            physicalResistance: 1.3
          }
        },
        {
          name: 'Craftsmanship',
          description: 'Natural talent for crafting and engineering',
          effects: {
            craftingQuality: 1.2,
            engineeringUnderstanding: 1.3
          }
        }
      ],
      lifespan: {
        average: 350,
        maximum: 450
      }
    });
  }

  /**
   * Get all available races
   */
  static getAllRaces() {
    return Array.from(RacialTraits._raceDefinitions.values());
  }

  /**
   * Get all subraces for a specific race
   */
  static getSubraces(raceId) {
    const race = RacialTraits._getRaceData(raceId);
    return race ? race.subraces : [];
  }

  /**
   * Check if a race exists
   */
  static hasRace(raceId) {
    return RacialTraits._raceDefinitions.has(raceId);
  }
}

// Initialize race definitions when the module loads
RacialTraits._initializeRaces();