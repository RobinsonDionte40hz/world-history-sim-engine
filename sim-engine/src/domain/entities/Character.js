// src/domain/entities/Character.js

import { Alignment } from '../value-objects/Alignment.js';
import { Influence } from '../value-objects/Influence.js';
import { Prestige } from '../value-objects/Prestige.js';
import PersonalityProfile from '../value-objects/PersonalityProfile.js';
import { RacialTraits } from '../value-objects/RacialTraits.js';
import AlignmentService from '../services/AlignmentService.js';
import InfluenceService from '../services/InfluenceService.js';
import PrestigeService from '../services/PrestigeService.js';
import PrerequisiteValidator from '../services/PrerequisiteValidator.js';

class Character {
  constructor(config = {}) {
    // Basic character properties
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Character';
    this.age = config.age || 25;
    this.level = config.level || 1;
    
    // Initialize racial traits first (affects other systems)
    this.racialTraits = config.racialTraits instanceof RacialTraits 
      ? config.racialTraits 
      : new RacialTraits(config.raceId || 'human', config.subraceId);
    
    // Initialize personality profile with racial influence
    const personalityConfig = this._mergePersonalityWithRacialInfluence(
      config.personalityConfig || {},
      this.racialTraits
    );
    this.personality = config.personality instanceof PersonalityProfile
      ? config.personality
      : new PersonalityProfile(personalityConfig);
    
    // Initialize alignment with default axes if not provided
    const alignmentAxes = config.alignmentAxes || this._getDefaultAlignmentAxes();
    const alignmentValues = config.alignmentValues || {};
    const alignmentHistory = config.alignmentHistory || {};
    this.alignment = config.alignment instanceof Alignment
      ? config.alignment
      : new Alignment(alignmentAxes, alignmentValues, alignmentHistory);
    
    // Initialize influence with default domains if not provided
    const influenceDomains = config.influenceDomains || this._getDefaultInfluenceDomains();
    const influenceValues = config.influenceValues || {};
    const influenceHistory = config.influenceHistory || {};
    this.influence = config.influence instanceof Influence
      ? config.influence
      : new Influence(influenceDomains, influenceValues, influenceHistory);
    
    // Initialize prestige with default tracks if not provided
    const prestigeTracks = config.prestigeTracks || this._getDefaultPrestigeTracks();
    const prestigeValues = config.prestigeValues || {};
    const prestigeHistory = config.prestigeHistory || {};
    this.prestige = config.prestige instanceof Prestige
      ? config.prestige
      : new Prestige(prestigeTracks, prestigeValues, prestigeHistory);
    
    // Apply racial modifiers to base attributes
    this.baseAttributes = config.baseAttributes || this._getDefaultAttributes();
    this.attributes = this.racialTraits.applyAttributeModifiers(this.baseAttributes);
    
    // Apply racial modifiers to base skills
    this.baseSkills = config.baseSkills || this._getDefaultSkills();
    this.skills = this.racialTraits.applySkillModifiers(this.baseSkills);
    
    // Other character properties
    this.inventory = config.inventory || [];
    this.quests = config.quests || [];
    this.relationships = config.relationships || new Map();
    this.memories = config.memories || [];
    this.location = config.location || null;
    
    // Freeze the character to maintain immutability at the entity level
    Object.freeze(this);
  }

  /**
   * Check if character meets prerequisites for an interaction
   */
  meetsPrerequisites(interaction) {
    return PrerequisiteValidator.validatePrerequisites(interaction, this.getStateForValidation());
  }

  /**
   * Get character state for validation purposes
   */
  getStateForValidation() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      age: this.age,
      attributes: this.attributes,
      skills: this.skills,
      alignment: this.alignment.values,
      influence: this.influence.values,
      prestige: this.prestige.values,
      personality: this.personality.getAllTraits().reduce((acc, trait) => {
        acc[trait.id] = trait.intensity;
        return acc;
      }, {}),
      racialTraits: this.racialTraits.getFeatures(),
      inventory: this.inventory,
      quests: this.quests,
      location: this.location
    };
  }

  /**
   * Create a new Character with updated alignment
   */
  withAlignment(newAlignment) {
    if (!(newAlignment instanceof Alignment)) {
      throw new Error('New alignment must be an instance of Alignment');
    }
    
    return new Character({
      ...this._getSerializableConfig(),
      alignment: newAlignment
    });
  }

  /**
   * Create a new Character with updated influence
   */
  withInfluence(newInfluence) {
    if (!(newInfluence instanceof Influence)) {
      throw new Error('New influence must be an instance of Influence');
    }
    
    return new Character({
      ...this._getSerializableConfig(),
      influence: newInfluence
    });
  }

  /**
   * Create a new Character with updated prestige
   */
  withPrestige(newPrestige) {
    if (!(newPrestige instanceof Prestige)) {
      throw new Error('New prestige must be an instance of Prestige');
    }
    
    return new Character({
      ...this._getSerializableConfig(),
      prestige: newPrestige
    });
  }

  /**
   * Create a new Character with updated personality
   */
  withPersonality(newPersonality) {
    if (!(newPersonality instanceof PersonalityProfile)) {
      throw new Error('New personality must be an instance of PersonalityProfile');
    }
    
    return new Character({
      ...this._getSerializableConfig(),
      personality: newPersonality
    });
  }

  /**
   * Create a new Character with updated age and age-related modifications
   */
  withAge(newAge) {
    if (typeof newAge !== 'number' || newAge < 0) {
      throw new Error('Age must be a non-negative number');
    }
    
    // Apply age modifiers to personality
    const ageModifiedPersonality = this.personality.withAgeModifiers(newAge);
    
    // Apply racial age modifiers
    const racialAgeModifiers = this.racialTraits.calculateAgeModifiers(newAge);
    
    return new Character({
      ...this._getSerializableConfig(),
      age: newAge,
      personality: ageModifiedPersonality,
      // Apply racial age modifiers to attributes if needed
      baseAttributes: this._applyAgeModifiersToAttributes(this.baseAttributes, racialAgeModifiers)
    });
  }

  /**
   * Get character's current social standing in a settlement
   */
  getSocialStanding(settlement) {
    return PrestigeService.calculateSocialStanding(this.prestige, settlement, {
      age: this.age,
      charisma: this.attributes.charisma || 10,
      role: this.role || 'citizen'
    });
  }

  /**
   * Get character's influence analysis
   */
  getInfluenceAnalysis() {
    return InfluenceService.analyzeInfluenceDistribution(this.influence);
  }

  /**
   * Get character's alignment compatibility with another character
   */
  getAlignmentCompatibility(otherCharacter) {
    if (!(otherCharacter instanceof Character)) {
      throw new Error('Other character must be an instance of Character');
    }
    
    const alignmentService = new AlignmentService();
    return alignmentService.analyzeCompatibility(this.alignment, otherCharacter.alignment);
  }

  /**
   * Apply historical event to character, updating alignment, personality, and other systems
   */
  withHistoricalEvent(historicalEvent, characterRole = {}, historicalContext = {}) {
    if (!historicalEvent || typeof historicalEvent !== 'object') {
      throw new Error('Historical event must be provided as an object');
    }

    // Apply historical event to alignment
    const alignmentService = new AlignmentService();
    const personalityTraits = this._getPersonalityTraitsForAlignment();
    const newAlignment = alignmentService.evolveAlignment(
      this.alignment,
      historicalEvent,
      historicalContext,
      personalityTraits
    );

    // Apply historical event to personality
    const newPersonality = this.personality.withHistoricalEventInfluence(
      historicalEvent,
      characterRole
    );

    // Apply historical event to influence if it affects settlements
    let newInfluence = this.influence;
    if (historicalEvent.affectsSettlements && historicalContext.settlement) {
      const influenceService = new InfluenceService();
      newInfluence = influenceService.updateInfluence(
        this.influence,
        historicalContext.settlement,
        historicalEvent,
        this._getCharacterContextForServices()
      );
    }

    // Apply historical event to prestige if it involves achievements
    let newPrestige = this.prestige;
    if (historicalEvent.prestigeImpact && historicalContext.socialContext) {
      const prestigeService = new PrestigeService();
      const achievement = {
        type: historicalEvent.type,
        description: historicalEvent.description,
        magnitude: historicalEvent.magnitude || 1,
        subtype: historicalEvent.subtype,
        context: historicalEvent.context
      };
      newPrestige = prestigeService.updatePrestige(
        this.prestige,
        achievement,
        historicalContext.socialContext,
        this._getCharacterContextForServices()
      );
    }

    return new Character({
      ...this._getSerializableConfig(),
      alignment: newAlignment,
      personality: newPersonality,
      influence: newInfluence,
      prestige: newPrestige
    });
  }

  /**
   * Apply temporal evolution to character (aging, personality drift, decay)
   */
  withTemporalEvolution(timeElapsed, lifeExperiences = [], activeSettlements = []) {
    if (typeof timeElapsed !== 'number' || timeElapsed <= 0) {
      throw new Error('Time elapsed must be a positive number');
    }

    // Calculate new age
    const newAge = this.age + (timeElapsed / 365); // Assuming timeElapsed is in days

    // Apply age-based personality changes
    const ageModifiedPersonality = this.personality.withAgeModifiers(newAge);

    // Apply personality-driven alignment shifts
    const alignmentService = new AlignmentService();
    const personalityTraits = this._getPersonalityTraitsForAlignment();
    const alignmentWithDrift = alignmentService.calculateAlignmentShift(
      this.alignment,
      personalityTraits,
      timeElapsed,
      lifeExperiences
    );

    // Apply influence decay over time
    const influenceService = new InfluenceService();
    const decayedInfluence = influenceService.calculateInfluenceDecay(
      this.influence,
      timeElapsed,
      this._getCharacterContextForServices(),
      activeSettlements
    );

    // Apply prestige decay over time
    const prestigeService = new PrestigeService();
    const decayedPrestige = prestigeService.applyTimeDecay(
      this.prestige,
      timeElapsed,
      null, // Use default decay rates
      this._getCharacterContextForServices()
    );

    // Apply racial age modifiers to attributes
    const racialAgeModifiers = this.racialTraits.calculateAgeModifiers(newAge);
    const ageModifiedAttributes = this._applyAgeModifiersToAttributes(
      this.baseAttributes,
      racialAgeModifiers
    );

    return new Character({
      ...this._getSerializableConfig(),
      age: newAge,
      personality: ageModifiedPersonality,
      alignment: alignmentWithDrift,
      influence: decayedInfluence,
      prestige: decayedPrestige,
      baseAttributes: ageModifiedAttributes
    });
  }

  /**
   * Apply settlement interaction to character
   */
  withSettlementInteraction(settlement, interaction, otherCharacters = []) {
    if (!settlement || typeof settlement !== 'object') {
      throw new Error('Settlement must be provided as an object');
    }
    if (!interaction || typeof interaction !== 'object') {
      throw new Error('Interaction must be provided as an object');
    }

    // Apply settlement interaction to influence
    const influenceService = new InfluenceService();
    const newInfluence = influenceService.applyCharacterAction(
      this.influence,
      interaction,
      settlement,
      this._getCharacterContextForServices()
    );

    // Apply social interactions to prestige if other characters are involved
    let newPrestige = this.prestige;
    if (otherCharacters.length > 0 && interaction.type === 'social') {
      const prestigeService = new PrestigeService();
      for (const otherCharacter of otherCharacters) {
        const socialContext = {
          witnesses: settlement.population ? Math.min(settlement.population / 100, 50) : 0,
          settlementId: settlement.id,
          settlementName: settlement.name
        };
        newPrestige = prestigeService.applySocialInteraction(
          newPrestige,
          interaction,
          otherCharacter,
          socialContext
        );
      }
    }

    // Apply personality changes from social interactions
    let newPersonality = this.personality;
    if (otherCharacters.length > 0) {
      for (const otherCharacter of otherCharacters) {
        newPersonality = newPersonality.withSocialInfluence(
          interaction,
          otherCharacter
        );
      }
    }

    return new Character({
      ...this._getSerializableConfig(),
      influence: newInfluence,
      prestige: newPrestige,
      personality: newPersonality
    });
  }

  /**
   * Apply moral choice to character alignment and personality
   */
  withMoralChoice(moralChoice, socialContext = {}) {
    if (!moralChoice || typeof moralChoice !== 'object') {
      throw new Error('Moral choice must be provided as an object');
    }

    // Apply moral choice to alignment
    const alignmentService = new AlignmentService();
    const personalityTraits = this._getPersonalityTraitsForAlignment();
    const newAlignment = alignmentService.applyMoralChoice(
      this.alignment,
      moralChoice,
      personalityTraits,
      socialContext
    );

    // Apply moral choice as experience to personality
    const experience = {
      type: 'moral_choice',
      description: moralChoice.description,
      intensity: moralChoice.intensity || 0.5,
      duration: 1
    };
    const newPersonality = this.personality.withExperienceInfluence(
      experience,
      socialContext
    );

    return new Character({
      ...this._getSerializableConfig(),
      alignment: newAlignment,
      personality: newPersonality
    });
  }

  /**
   * Apply trauma to character personality and alignment
   */
  withTrauma(trauma, severity = 0.5) {
    if (!trauma || typeof trauma !== 'object') {
      throw new Error('Trauma must be provided as an object');
    }
    if (typeof severity !== 'number' || severity < 0 || severity > 1) {
      throw new Error('Severity must be a number between 0 and 1');
    }

    // Apply trauma to personality
    const newPersonality = this.personality.withTraumaInfluence(trauma, severity);

    // Trauma can also affect alignment (making people more cautious, cynical, etc.)
    let newAlignment = this.alignment;
    if (trauma.alignmentImpact) {
      const alignmentService = new AlignmentService();
      const personalityTraits = this._getPersonalityTraitsForAlignment();
      
      // Create a trauma-based moral choice
      const traumaChoice = {
        description: `Trauma response: ${trauma.description}`,
        alignmentImpact: new Map(Object.entries(trauma.alignmentImpact)),
        intensity: severity
      };
      
      newAlignment = alignmentService.applyMoralChoice(
        this.alignment,
        traumaChoice,
        personalityTraits,
        { traumatic: true, severity }
      );
    }

    return new Character({
      ...this._getSerializableConfig(),
      personality: newPersonality,
      alignment: newAlignment
    });
  }

  /**
   * Serialize character to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      level: this.level,
      
      // Value objects
      alignment: this.alignment.toJSON(),
      influence: this.influence.toJSON(),
      prestige: this.prestige.toJSON(),
      personality: this.personality.toJSON(),
      racialTraits: this.racialTraits.toJSON(),
      
      // Attributes and skills
      baseAttributes: { ...this.baseAttributes },
      attributes: { ...this.attributes },
      baseSkills: { ...this.baseSkills },
      skills: { ...this.skills },
      
      // Other properties
      inventory: [...this.inventory],
      quests: [...this.quests],
      relationships: Array.from(this.relationships.entries()),
      memories: [...this.memories],
      location: this.location
    };
  }

  /**
   * Create Character from JSON data
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Character');
    }
    
    return new Character({
      id: data.id,
      name: data.name,
      age: data.age,
      level: data.level,
      
      // Reconstruct value objects
      alignment: data.alignment ? Alignment.fromJSON(data.alignment) : undefined,
      influence: data.influence ? Influence.fromJSON(data.influence) : undefined,
      prestige: data.prestige ? Prestige.fromJSON(data.prestige) : undefined,
      personality: data.personality ? PersonalityProfile.fromJSON(data.personality) : undefined,
      racialTraits: data.racialTraits ? RacialTraits.fromJSON(data.racialTraits) : undefined,
      
      // Attributes and skills
      baseAttributes: data.baseAttributes,
      baseSkills: data.baseSkills,
      
      // Other properties
      inventory: data.inventory,
      quests: data.quests,
      relationships: data.relationships ? new Map(data.relationships) : undefined,
      memories: data.memories,
      location: data.location
    });
  }

  /**
   * Private helper methods
   */

  /**
   * Generate a unique ID for the character
   */
  _generateId() {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get serializable configuration for creating new Character instances
   */
  _getSerializableConfig() {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      level: this.level,
      alignment: this.alignment,
      influence: this.influence,
      prestige: this.prestige,
      personality: this.personality,
      racialTraits: this.racialTraits,
      baseAttributes: this.baseAttributes,
      baseSkills: this.baseSkills,
      inventory: this.inventory,
      quests: this.quests,
      relationships: this.relationships,
      memories: this.memories,
      location: this.location
    };
  }

  /**
   * Merge personality configuration with racial influence
   */
  _mergePersonalityWithRacialInfluence(personalityConfig, racialTraits) {
    const racialInfluence = racialTraits.getPersonalityInfluence();
    const mergedConfig = { ...personalityConfig };
    
    // Apply racial personality influences to traits
    if (mergedConfig.traits) {
      mergedConfig.traits = mergedConfig.traits.map(trait => {
        const racialModifier = racialInfluence[trait.id] || 0;
        return {
          ...trait,
          intensity: Math.max(0, Math.min(1, (trait.intensity || 0.5) + racialModifier)),
          influence: {
            ...trait.influence,
            racial: racialModifier
          }
        };
      });
    }
    
    return mergedConfig;
  }

  /**
   * Apply age modifiers to base attributes
   */
  _applyAgeModifiersToAttributes(baseAttributes, ageModifiers) {
    const modifiedAttributes = { ...baseAttributes };
    
    Object.entries(ageModifiers).forEach(([modifier, value]) => {
      switch (modifier) {
        case 'physical':
          ['strength', 'dexterity', 'constitution'].forEach(attr => {
            if (modifiedAttributes[attr]) {
              modifiedAttributes[attr] = Math.max(3, Math.round(modifiedAttributes[attr] * value));
            }
          });
          break;
        case 'wisdom':
          if (modifiedAttributes.wisdom) {
            modifiedAttributes.wisdom = Math.min(20, Math.round(modifiedAttributes.wisdom * value));
          }
          break;
      }
    });
    
    return modifiedAttributes;
  }

  /**
   * Get default alignment axes
   */
  _getDefaultAlignmentAxes() {
    return [
      {
        id: 'moral',
        name: 'Moral Axis',
        description: 'Good vs Evil alignment',
        min: -50,
        max: 50,
        defaultValue: 0,
        zones: [
          { name: 'Evil', min: -50, max: -16 },
          { name: 'Neutral', min: -15, max: 15 },
          { name: 'Good', min: 16, max: 50 }
        ]
      },
      {
        id: 'ethical',
        name: 'Ethical Axis',
        description: 'Lawful vs Chaotic alignment',
        min: -50,
        max: 50,
        defaultValue: 0,
        zones: [
          { name: 'Chaotic', min: -50, max: -16 },
          { name: 'Neutral', min: -15, max: 15 },
          { name: 'Lawful', min: 16, max: 50 }
        ]
      }
    ];
  }

  /**
   * Get default influence domains
   */
  _getDefaultInfluenceDomains() {
    return [
      {
        id: 'political',
        name: 'Political Influence',
        description: 'Influence in political circles',
        min: 0,
        max: 100,
        defaultValue: 0,
        tiers: [
          { name: 'None', min: 0, max: 9 },
          { name: 'Minor', min: 10, max: 24 },
          { name: 'Moderate', min: 25, max: 49 },
          { name: 'Major', min: 50, max: 74 },
          { name: 'Dominant', min: 75, max: 100 }
        ]
      },
      {
        id: 'social',
        name: 'Social Influence',
        description: 'Influence in social circles',
        min: 0,
        max: 100,
        defaultValue: 10,
        tiers: [
          { name: 'Outcast', min: 0, max: 9 },
          { name: 'Unknown', min: 10, max: 24 },
          { name: 'Known', min: 25, max: 49 },
          { name: 'Popular', min: 50, max: 74 },
          { name: 'Celebrity', min: 75, max: 100 }
        ]
      },
      {
        id: 'economic',
        name: 'Economic Influence',
        description: 'Influence in economic matters',
        min: 0,
        max: 100,
        defaultValue: 5,
        tiers: [
          { name: 'Destitute', min: 0, max: 9 },
          { name: 'Poor', min: 10, max: 24 },
          { name: 'Middle Class', min: 25, max: 49 },
          { name: 'Wealthy', min: 50, max: 74 },
          { name: 'Elite', min: 75, max: 100 }
        ]
      }
    ];
  }

  /**
   * Get default prestige tracks
   */
  _getDefaultPrestigeTracks() {
    return [
      {
        id: 'honor',
        name: 'Honor',
        description: 'Personal honor and reputation',
        min: 0,
        max: 100,
        defaultValue: 25,
        decayRate: 0.02,
        levels: [
          { name: 'Disgraced', min: 0, max: 9, politicalPower: 0 },
          { name: 'Unknown', min: 10, max: 24, politicalPower: 1 },
          { name: 'Respectable', min: 25, max: 49, politicalPower: 2 },
          { name: 'Honored', min: 50, max: 74, politicalPower: 4 },
          { name: 'Legendary', min: 75, max: 100, politicalPower: 8 }
        ]
      },
      {
        id: 'social',
        name: 'Social Prestige',
        description: 'Standing in social circles',
        min: 0,
        max: 100,
        defaultValue: 20,
        decayRate: 0.03,
        levels: [
          { name: 'Outcast', min: 0, max: 9, politicalPower: 0 },
          { name: 'Commoner', min: 10, max: 24, politicalPower: 0 },
          { name: 'Notable', min: 25, max: 49, politicalPower: 1 },
          { name: 'Prominent', min: 50, max: 74, politicalPower: 3 },
          { name: 'Elite', min: 75, max: 100, politicalPower: 6 }
        ]
      }
    ];
  }

  /**
   * Get default attributes
   */
  _getDefaultAttributes() {
    return {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    };
  }

  /**
   * Get default skills
   */
  _getDefaultSkills() {
    return {
      athletics: 0,
      stealth: 0,
      perception: 0,
      investigation: 0,
      persuasion: 0,
      deception: 0,
      intimidation: 0,
      insight: 0,
      survival: 0,
      medicine: 0
    };
  }

  /**
   * Get personality traits formatted for alignment service
   */
  _getPersonalityTraitsForAlignment() {
    const traits = {};
    this.personality.getAllTraits().forEach(trait => {
      traits[trait.id] = trait.intensity;
    });
    return traits;
  }

  /**
   * Get character context for service calls
   */
  _getCharacterContextForServices() {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      level: this.level,
      role: this.role || 'citizen',
      charisma: this.attributes.charisma || 10,
      socialSkill: this.skills.persuasion || 0,
      wealth: this.wealth || 0,
      militaryRank: this.militaryRank || 0,
      culture: this.culture || 'unknown'
    };
  }
}

export default Character;