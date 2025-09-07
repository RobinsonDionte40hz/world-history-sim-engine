// src/domain/entities/Character.js

import { Alignment } from '../value-objects/Alignment.js';
import { Influence } from '../value-objects/Influence.js';
import { Prestige } from '../value-objects/Prestige.js';
import PersonalityProfile from '../value-objects/PersonalityProfile.js';
import { RacialTraits } from '../value-objects/RacialTraits.js';
import { CharacterType } from '../value-objects/CharacterType.js';
import Attributes from '../value-objects/Attributes.js';
import AlignmentService from '../services/AlignmentService.js';
import InfluenceService from '../services/InfluenceService.js';
import PrestigeService from '../services/PrestigeService.js';
import { PrerequisiteValidator } from '../services/PrerequisiteValidator.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';
import MemoryService from '../services/MemoryService.js';

class Character {
  constructor(config = {}) {
    // Basic character properties
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Character';
    this.age = config.age !== undefined ? config.age : 25;
    this.level = config.level || 1;

    // Character type for validation and field requirements
    this.characterType = config.characterType instanceof CharacterType
      ? config.characterType
      : (config.characterTypeId ? this._createCharacterTypeFromId(config.characterTypeId) : this._getDefaultCharacterType());

    // Assignment tracking - tracks what this character is assigned to
    this.assignments = config.assignments || {
      nodes: new Set(config.assignedNodeIds || []),
      interactions: new Set(config.assignedInteractionIds || []),
      quests: new Set(config.assignedQuestIds || []),
      settlements: new Set(config.assignedSettlementIds || []),
      factions: new Set(config.assignedFactionIds || [])
    };

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
    const racialModifiedAttributes = this.racialTraits.applyAttributeModifiers(this._convertAttributesToSimple(this.baseAttributes));
    this.attributes = config.attributes instanceof Attributes
      ? config.attributes
      : new Attributes(this._convertSimpleToAttributes(racialModifiedAttributes));

    // Apply racial modifiers to base skills
    this.baseSkills = config.baseSkills || this._getDefaultSkills();
    this.skills = this.racialTraits.applySkillModifiers(this.baseSkills);

    // Other character properties
    this.inventory = config.inventory || [];
    this.quests = config.quests || [];
    this.relationships = config.relationships || new Map();
    this.memories = config.memories || [];
    this.location = config.location || null;

    // Add these default properties to prevent undefined errors
    this.energy = config.energy !== undefined ? config.energy : 50;
    this.maxEnergy = config.maxEnergy !== undefined ? config.maxEnergy : 100;
    this.health = config.health !== undefined ? config.health : 100;
    this.mood = config.mood !== undefined ? config.mood : 50;
    this.currentNodeId = config.currentNodeId || null;
    this.lastInteractionType = config.lastInteractionType || null;

    // Ensure consciousness exists with proper structure
    this.consciousness = config.consciousness || {
      frequency: 40, // Default gamma baseline
      coherence: 0.5
    };

    // Ensure goals array exists
    this.goals = Array.isArray(config.goals) ? config.goals : [];

    // Initialize decision history for memory system
    this.decisionHistory = config.decisionHistory || [];

    // Need satisfaction behavior modifiers (temporary, applied during turn processing)
    this.needBasedBehaviorChanges = config.needBasedBehaviorChanges || [];
    this.needBasedInteractionModifiers = config.needBasedInteractionModifiers || {};

    // Validate character data against type requirements
    this._validateAgainstType();

    // Note: Character is no longer frozen to allow interaction system modifications
    // Object.freeze(this);
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
      location: this.location,
      characterType: this.characterType.typeId,
      assignments: this.getAssignmentSummary()
    };
  }

  /**
   * Validate character data against the character type requirements
   * @returns {object} - Validation result with success flag and errors
   */
  validateAgainstType() {
    return this.characterType.validateCharacterData({
      name: this.name,
      age: this.age,
      attributes: this.attributes,
      skills: this.skills,
      personality: this.personality,
      alignment: this.alignment,
      influence: this.influence,
      prestige: this.prestige,
      racialTraits: this.racialTraits,
      inventory: this.inventory,
      quests: this.quests,
      relationships: this.relationships,
      memories: this.memories,
      location: this.location,
      energy: this.energy,
      health: this.health,
      mood: this.mood,
      goals: this.goals
    });
  }

  /**
   * Check if this character can be assigned to a specific assignment type
   * @param {string} assignmentType - Type of assignment to check
   * @returns {boolean}
   */
  canBeAssignedTo(assignmentType) {
    return this.characterType.canBeAssignedTo(assignmentType);
  }

  /**
   * Get all assignments for this character
   * @returns {object} - Object containing all assignment sets
   */
  getAssignments() {
    return {
      nodes: new Set(this.assignments.nodes),
      interactions: new Set(this.assignments.interactions),
      quests: new Set(this.assignments.quests),
      settlements: new Set(this.assignments.settlements),
      factions: new Set(this.assignments.factions)
    };
  }

  /**
   * Get assignment summary with counts
   * @returns {object} - Summary of assignments with counts
   */
  getAssignmentSummary() {
    return {
      totalAssignments: this.getTotalAssignmentCount(),
      byType: {
        nodes: this.assignments.nodes.size,
        interactions: this.assignments.interactions.size,
        quests: this.assignments.quests.size,
        settlements: this.assignments.settlements.size,
        factions: this.assignments.factions.size
      },
      nodeIds: Array.from(this.assignments.nodes),
      interactionIds: Array.from(this.assignments.interactions),
      questIds: Array.from(this.assignments.quests),
      settlementIds: Array.from(this.assignments.settlements),
      factionIds: Array.from(this.assignments.factions)
    };
  }

  /**
   * Get total number of assignments
   * @returns {number}
   */
  getTotalAssignmentCount() {
    return this.assignments.nodes.size + 
           this.assignments.interactions.size + 
           this.assignments.quests.size + 
           this.assignments.settlements.size + 
           this.assignments.factions.size;
  }

  /**
   * Check if character is assigned to a specific item
   * @param {string} assignmentType - Type of assignment (nodes, interactions, etc.)
   * @param {string} itemId - ID of the item to check
   * @returns {boolean}
   */
  isAssignedTo(assignmentType, itemId) {
    if (!this.assignments[assignmentType]) {
      return false;
    }
    return this.assignments[assignmentType].has(itemId);
  }

  /**
   * Check if character has any assignments of a specific type
   * @param {string} assignmentType - Type of assignment to check
   * @returns {boolean}
   */
  hasAssignmentsOfType(assignmentType) {
    return this.assignments[assignmentType] && this.assignments[assignmentType].size > 0;
  }

  /**
   * Assign character to a node
   * @param {string} nodeId - ID of the node to assign to
   * @returns {Character} - New Character instance with the assignment
   */
  assignToNode(nodeId) {
    if (!this.canBeAssignedTo('node')) {
      throw new ValidationError('assignment', nodeId, `Character type '${this.characterType.name}' cannot be assigned to nodes`);
    }
    
    if (this.assignments.nodes.has(nodeId)) {
      return this; // Already assigned, return same instance
    }

    const newAssignments = {
      ...this.assignments,
      nodes: new Set([...this.assignments.nodes, nodeId])
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Unassign character from a node
   * @param {string} nodeId - ID of the node to unassign from
   * @returns {Character} - New Character instance without the assignment
   */
  unassignFromNode(nodeId) {
    if (!this.assignments.nodes.has(nodeId)) {
      return this; // Not assigned, return same instance
    }

    const newNodes = new Set(this.assignments.nodes);
    newNodes.delete(nodeId);
    
    const newAssignments = {
      ...this.assignments,
      nodes: newNodes
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Assign character to an interaction
   * @param {string} interactionId - ID of the interaction to assign to
   * @returns {Character} - New Character instance with the assignment
   */
  assignToInteraction(interactionId) {
    if (!this.canBeAssignedTo('interaction')) {
      throw new ValidationError('assignment', interactionId, `Character type '${this.characterType.name}' cannot be assigned to interactions`);
    }
    
    if (this.assignments.interactions.has(interactionId)) {
      return this; // Already assigned
    }

    const newAssignments = {
      ...this.assignments,
      interactions: new Set([...this.assignments.interactions, interactionId])
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Unassign character from an interaction
   * @param {string} interactionId - ID of the interaction to unassign from
   * @returns {Character} - New Character instance without the assignment
   */
  unassignFromInteraction(interactionId) {
    if (!this.assignments.interactions.has(interactionId)) {
      return this; // Not assigned
    }

    const newInteractions = new Set(this.assignments.interactions);
    newInteractions.delete(interactionId);
    
    const newAssignments = {
      ...this.assignments,
      interactions: newInteractions
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Assign character to a quest
   * @param {string} questId - ID of the quest to assign to
   * @returns {Character} - New Character instance with the assignment
   */
  assignToQuest(questId) {
    if (!this.canBeAssignedTo('quest')) {
      throw new ValidationError('assignment', questId, `Character type '${this.characterType.name}' cannot be assigned to quests`);
    }
    
    if (this.assignments.quests.has(questId)) {
      return this; // Already assigned
    }

    const newAssignments = {
      ...this.assignments,
      quests: new Set([...this.assignments.quests, questId])
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Unassign character from a quest
   * @param {string} questId - ID of the quest to unassign from
   * @returns {Character} - New Character instance without the assignment
   */
  unassignFromQuest(questId) {
    if (!this.assignments.quests.has(questId)) {
      return this; // Not assigned
    }

    const newQuests = new Set(this.assignments.quests);
    newQuests.delete(questId);
    
    const newAssignments = {
      ...this.assignments,
      quests: newQuests
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Assign character to a settlement
   * @param {string} settlementId - ID of the settlement to assign to
   * @returns {Character} - New Character instance with the assignment
   */
  assignToSettlement(settlementId) {
    if (!this.canBeAssignedTo('settlement')) {
      throw new ValidationError('assignment', settlementId, `Character type '${this.characterType.name}' cannot be assigned to settlements`);
    }
    
    if (this.assignments.settlements.has(settlementId)) {
      return this; // Already assigned
    }

    const newAssignments = {
      ...this.assignments,
      settlements: new Set([...this.assignments.settlements, settlementId])
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Unassign character from a settlement
   * @param {string} settlementId - ID of the settlement to unassign from
   * @returns {Character} - New Character instance without the assignment
   */
  unassignFromSettlement(settlementId) {
    if (!this.assignments.settlements.has(settlementId)) {
      return this; // Not assigned
    }

    const newSettlements = new Set(this.assignments.settlements);
    newSettlements.delete(settlementId);
    
    const newAssignments = {
      ...this.assignments,
      settlements: newSettlements
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Assign character to a faction
   * @param {string} factionId - ID of the faction to assign to
   * @returns {Character} - New Character instance with the assignment
   */
  assignToFaction(factionId) {
    if (!this.canBeAssignedTo('faction')) {
      throw new ValidationError('assignment', factionId, `Character type '${this.characterType.name}' cannot be assigned to factions`);
    }
    
    if (this.assignments.factions.has(factionId)) {
      return this; // Already assigned
    }

    const newAssignments = {
      ...this.assignments,
      factions: new Set([...this.assignments.factions, factionId])
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Unassign character from a faction
   * @param {string} factionId - ID of the faction to unassign from
   * @returns {Character} - New Character instance without the assignment
   */
  unassignFromFaction(factionId) {
    if (!this.assignments.factions.has(factionId)) {
      return this; // Not assigned
    }

    const newFactions = new Set(this.assignments.factions);
    newFactions.delete(factionId);
    
    const newAssignments = {
      ...this.assignments,
      factions: newFactions
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Clear all assignments of a specific type
   * @param {string} assignmentType - Type of assignments to clear
   * @returns {Character} - New Character instance with cleared assignments
   */
  clearAssignmentsOfType(assignmentType) {
    if (!this.assignments[assignmentType] || this.assignments[assignmentType].size === 0) {
      return this; // No assignments to clear
    }

    const newAssignments = {
      ...this.assignments,
      [assignmentType]: new Set()
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Clear all assignments
   * @returns {Character} - New Character instance with no assignments
   */
  clearAllAssignments() {
    if (this.getTotalAssignmentCount() === 0) {
      return this; // No assignments to clear
    }

    const newAssignments = {
      nodes: new Set(),
      interactions: new Set(),
      quests: new Set(),
      settlements: new Set(),
      factions: new Set()
    };

    return new Character({
      ...this._getSerializableConfig(),
      assignments: newAssignments
    });
  }

  /**
   * Update character type and revalidate
   * @param {CharacterType} newCharacterType - New character type
   * @returns {Character} - New Character instance with updated type
   */
  withCharacterType(newCharacterType) {
    if (!(newCharacterType instanceof CharacterType)) {
      throw new ValidationError('characterType', newCharacterType, 'Character type must be an instance of CharacterType');
    }

    const newCharacter = new Character({
      ...this._getSerializableConfig(),
      characterType: newCharacterType
    });

    // Validate against new type
    const validation = newCharacter.validateAgainstType();
    if (!validation.success) {
      const errorMessages = validation.errors.map(err => err.message).join('; ');
      throw new ValidationError('characterType', newCharacterType, `Character data does not meet requirements for type '${newCharacterType.name}': ${errorMessages}`);
    }

    return newCharacter;
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

      // Character type and assignments
      characterType: this.characterType.toJSON(),
      assignments: {
        nodes: Array.from(this.assignments.nodes),
        interactions: Array.from(this.assignments.interactions),
        quests: Array.from(this.assignments.quests),
        settlements: Array.from(this.assignments.settlements),
        factions: Array.from(this.assignments.factions)
      },

      // Value objects
      alignment: this.alignment.toJSON(),
      influence: this.influence.toJSON(),
      prestige: this.prestige.toJSON(),
      personality: this.personality.toJSON(),
      racialTraits: this.racialTraits.toJSON(),

      // Attributes and skills
      baseAttributes: { ...this.baseAttributes },
      attributes: this.attributes.toJSON(),
      baseSkills: { ...this.baseSkills },
      skills: { ...this.skills },

      // Other properties
      inventory: [...this.inventory],
      quests: [...this.quests],
      relationships: Array.from(this.relationships.entries()),
      memories: [...this.memories],
      location: this.location,

      // Add these properties to serialization
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      health: this.health,
      mood: this.mood,
      currentNodeId: this.currentNodeId,
      lastInteractionType: this.lastInteractionType,
      consciousness: this.consciousness,
      goals: this.goals,
      decisionHistory: this.decisionHistory,
      needBasedBehaviorChanges: this.needBasedBehaviorChanges,
      needBasedInteractionModifiers: this.needBasedInteractionModifiers
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

      // Reconstruct character type and assignments
      characterType: data.characterType ? CharacterType.fromJSON(data.characterType) : undefined,
      assignedNodeIds: data.assignments?.nodes || [],
      assignedInteractionIds: data.assignments?.interactions || [],
      assignedQuestIds: data.assignments?.quests || [],
      assignedSettlementIds: data.assignments?.settlements || [],
      assignedFactionIds: data.assignments?.factions || [],

      // Reconstruct value objects
      alignment: data.alignment ? Alignment.fromJSON(data.alignment) : undefined,
      influence: data.influence ? Influence.fromJSON(data.influence) : undefined,
      prestige: data.prestige ? Prestige.fromJSON(data.prestige) : undefined,
      personality: data.personality ? PersonalityProfile.fromJSON(data.personality) : undefined,
      racialTraits: data.racialTraits ? RacialTraits.fromJSON(data.racialTraits) : undefined,

      // Attributes and skills
      baseAttributes: data.baseAttributes,
      attributes: data.attributes ? Attributes.fromJSON(data.attributes) : undefined,
      baseSkills: data.baseSkills,

      // Other properties
      inventory: data.inventory,
      quests: data.quests,
      relationships: data.relationships ? new Map(data.relationships) : undefined,
      memories: data.memories,
      location: data.location,

      // Include these properties in deserialization
      energy: data.energy,
      maxEnergy: data.maxEnergy,
      health: data.health,
      mood: data.mood,
      currentNodeId: data.currentNodeId,
      lastInteractionType: data.lastInteractionType,
      consciousness: data.consciousness,
      goals: data.goals,
      decisionHistory: data.decisionHistory,
      needBasedBehaviorChanges: data.needBasedBehaviorChanges || [],
      needBasedInteractionModifiers: data.needBasedInteractionModifiers || {}
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
      characterType: this.characterType,
      assignments: this.assignments,
      alignment: this.alignment,
      influence: this.influence,
      prestige: this.prestige,
      personality: this.personality,
      racialTraits: this.racialTraits,
      baseAttributes: this.baseAttributes,
      attributes: this.attributes,
      baseSkills: this.baseSkills,
      inventory: this.inventory,
      quests: this.quests,
      relationships: this.relationships,
      memories: this.memories,
      location: this.location,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      health: this.health,
      mood: this.mood,
      currentNodeId: this.currentNodeId,
      lastInteractionType: this.lastInteractionType,
      consciousness: this.consciousness,
      goals: this.goals,
      decisionHistory: this.decisionHistory,
      needBasedBehaviorChanges: this.needBasedBehaviorChanges,
      needBasedInteractionModifiers: this.needBasedInteractionModifiers
    };
  }

  /**
   * Validate character against its type requirements (internal)
   * @private
   */
  _validateAgainstType() {
    const validation = this.validateAgainstType();
    if (!validation.success) {
      // For now, just log warnings for failed validation
      // In production, you might want to be more strict
      console.warn(`Character '${this.name}' (${this.id}) does not fully meet requirements for type '${this.characterType.name}':`, validation.errors);
      
      // Throw error only for critical validation failures
      const criticalErrors = validation.errors.filter(error => error.type === 'required');
      if (criticalErrors.length > 0) {
        const errorMessages = criticalErrors.map(err => err.message).join('; ');
        throw new ValidationError('characterValidation', this, `Character validation failed: ${errorMessages}`);
      }
    }
  }

  /**
   * Create character type from type ID
   * @param {string} typeId - The character type ID
   * @returns {CharacterType} - The character type instance
   * @private
   */
  _createCharacterTypeFromId(typeId) {
    const predefinedTypes = CharacterType.createPredefinedTypes();
    if (predefinedTypes[typeId]) {
      return predefinedTypes[typeId];
    }
    
    // If not found in predefined types, create a generic type with the given ID
    return new CharacterType({
      typeId: typeId,
      name: `Custom ${typeId.charAt(0).toUpperCase()}${typeId.slice(1)}`,
      description: `Custom character type: ${typeId}`
    });
  }

  /**
   * Get default character type
   * @returns {CharacterType} - Default generic character type
   * @private
   */
  _getDefaultCharacterType() {
    return CharacterType.createPredefinedTypes().generic;
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
        default:
          // Unknown modifier type - skip silently
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
   * Convert Attributes format to simple object format
   */
  _convertAttributesToSimple(attributesObj) {
    const result = {};
    Object.keys(attributesObj).forEach(key => {
      if (attributesObj[key] && typeof attributesObj[key] === 'object' && 'score' in attributesObj[key]) {
        result[key] = attributesObj[key].score;
      } else {
        result[key] = attributesObj[key];
      }
    });
    return result;
  }

  /**
   * Convert simple object format to Attributes format
   */
  _convertSimpleToAttributes(simpleAttributes) {
    const result = {};
    Object.keys(simpleAttributes).forEach(key => {
      result[key] = { score: simpleAttributes[key] };
    });
    return result;
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

  /**
   * Logs a decision made by the character for memory tracking
   * @param {string} interactionId - ID of the interaction executed
   * @param {string} outcome - Outcome of the interaction ('positive', 'negative', 'neutral')
   */
  logDecision(interactionId, outcome) {
    const decision = {
      interactionId,
      outcome,
      timestamp: Date.now(),
      significance: outcome === 'positive' ? 0.7 : outcome === 'negative' ? 0.3 : 0.5
    };
    this.decisionHistory.push(decision);
  }

  /**
   * Calculate interaction weight for decision making
   * @param {Object} interaction - The interaction to evaluate
   * @param {Object} worldState - Current world state
   * @returns {number} Weight score for the interaction
   */
  calculateInteractionWeight(interaction, worldState) {
    let weight = 0;
    
    // 1. GOAL PRIORITY (Make this DOMINANT)
    if (this.goals?.length > 0) {
      const matchesGoal = this.goals.some(goal => 
        interaction.name.toLowerCase().includes(goal.id.toLowerCase()) ||
        interaction.type === goal.type ||
        interaction.tags?.includes(goal.category)
      );
      
      if (matchesGoal) {
        weight += 10; // STRONG goal preference
      }
    }
    
    // 2. CRITICAL NEEDS (Override everything except goals)
    const energyPercent = this.energy / this.maxEnergy;
    
    if (interaction.type === 'rest') {
      if (energyPercent < 0.2) weight += 8;  // Critical need
      else if (energyPercent < 0.5) weight += 3;  // Moderate need
      else weight += 0.5;  // Low priority when not needed
    }
    
    // 3. ENVIRONMENTAL SUITABILITY (Simple modifiers)
    const environment = worldState.nodes.find(n => n.id === this.currentNodeId)?.environment;
    if (environment) {
      if (interaction.type === 'rest' && environment.isDangerous()) {
        weight *= 0.1;  // Heavily discourage rest in danger
      }
      if (interaction.type === 'movement' && environment.isDangerous()) {
        weight += 2;  // Encourage leaving dangerous areas
      }
    }
    
    // 4. PERSONALITY INFLUENCE (Simplified)
    if (this.personality?.traits) {
      const traits = this.personality.traits;
      
      // Match interaction to personality
      if (interaction.type === 'social' && traits.get('extrovert')?.value > 0.5) {
        weight += 2;
      }
      if (interaction.type === 'explore' && traits.get('adventurous')?.value > 0.5) {
        weight += 2;
      }
      if (interaction.type === 'rest' && traits.get('lazy')?.value > 0.5) {
        weight += 1;
      }
    }
    
    // 5. MEMORY (Simple positive/negative)
    const memoryService = new MemoryService();
    const memoryScore = memoryService.getMemoryInfluence(this, interaction);
    weight += memoryScore * 2;  // -2 to +2 based on past experience
    
    // 6. RANDOM VARIATION (Small, for variety)
    weight += Math.random() * 0.5;
    
    // Ensure non-negative
    return Math.max(0, weight);
  }
}

export default Character;