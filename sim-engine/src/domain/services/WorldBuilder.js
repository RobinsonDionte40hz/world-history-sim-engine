/**
 * WorldBuilder - Core service for preparing a world for simulation.
 * This service guides the user through a series of preparation phases to ensure
 * a valid and simulation-ready world configuration.
 */

import WorldValidator from './WorldValidator.js';
import Character from '../entities/Character.js';
import Node from '../entities/Node.js';
import NodeMigrationService from './NodeMigrationService.js';
import LODManager from './LODManager.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

class WorldBuilder {
  constructor(templateManager = null) {
    this.templateManager = templateManager;
    this.lodManager = new LODManager();

    // Mappless world configuration
    this.worldConfig = {
      // Phase 1: World Foundation
      name: null,
      description: null,
      rules: null,
      initialConditions: null,

      // Phase 2: Locations
      nodes: [],

      // Phase 3: Capabilities
      interactions: [],

      // Phase 4: Actors
      characters: [],

      // Phase 5: Actor Assignments
      nodePopulations: {},

      // Simulation readiness state
      isComplete: false,
      isValid: false,
      simulationReadiness: {
        worldFoundationDefined: false,
        locationsDefined: false,
        capabilitiesDefined: false,
        actorsDefined: false,
        actorsAssigned: false,
        readyForSimulation: false
      }
    };
  }

  // Phase 1: World Foundation

  /**
   * Sets basic world properties
   * @param {string} name - World name
   * @param {string} description - World description
   * @returns {WorldBuilder} This instance for chaining
   */
  setWorldProperties(name, description) {
    if (!name || typeof name !== 'string') {
      throw new Error('World name is required and must be a string');
    }

    if (!description || typeof description !== 'string') {
      throw new Error('World description is required and must be a string');
    }

    this.worldConfig.name = name;
    this.worldConfig.description = description;
    this._validatePreparationPhase('worldFoundationDefined');
    return this;
  }

  /**
   * Sets world rules for time progression and simulation parameters
   * @param {Object} rules - Rules configuration
   * @returns {WorldBuilder} This instance for chaining
   */
  setRules(rules) {
    if (!rules || typeof rules !== 'object') {
      throw new Error('Rules must be an object');
    }

    this.worldConfig.rules = { ...rules };
    this._validatePreparationPhase('worldFoundationDefined');
    return this;
  }

  /**
   * Sets initial conditions without spatial dimensions
   * @param {Object} conditions - Initial conditions
   * @returns {WorldBuilder} This instance for chaining
   */
  setInitialConditions(conditions) {
    if (!conditions || typeof conditions !== 'object') {
      throw new Error('Initial conditions must be an object');
    }

    this.worldConfig.initialConditions = { ...conditions };
    this._validatePreparationPhase('worldFoundationDefined');
    return this;
  }

  // Phase 2: Location Definition

  /**
   * Adds an abstract node (location/context) to the world
   * @param {Object} nodeConfig - Node configuration
   * @returns {WorldBuilder} This instance for chaining
   */
  addNode(nodeConfig) {
    if (!this._canProceedToPhase('locationsDefined')) {
      throw new Error('Cannot add nodes until the world foundation is defined.');
    }

    // Ensure the node has an ID before validation
    const enhancedConfig = {
      ...nodeConfig,
      id: nodeConfig.id || this._generateId('node')
    };

    // Use centralized validation
    const validation = WorldValidator.validateSingleNode(enhancedConfig);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(error => error.message).join('; ');
      throw new Error(`Node validation failed: ${errorMessages}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Node validation warnings:', validation.warnings);
    }

    // Create enhanced Node entity with environmental properties
    let node;
    try {
      // Create Node entity which handles environmental data
      node = new Node(enhancedConfig);
    } catch (error) {
      throw new ValidationError('nodeConfig', nodeConfig, `Node creation failed: ${error.message}`);
    }

    // Store as JSON for serialization compatibility
    this.worldConfig.nodes.push(node.toJSON());
    this._validatePreparationPhase('locationsDefined');
    return this;
  }

  /**
   * Adds a node from a template with customizations
   * @param {string} templateId - Template ID
   * @param {Object} customizations - Customizations to apply
   * @returns {WorldBuilder} This instance for chaining
   */
  addNodeFromTemplate(templateId, customizations = {}) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    const template = this.templateManager.getTemplate('nodes', templateId);
    if (!template) {
      throw new Error(`Node template not found: ${templateId}`);
    }

    const nodeConfig = {
      ...template,
      ...customizations,
      id: customizations.id || this._generateId('node'),
      templateId: templateId,
      isTemplateInstance: true
    };

    return this.addNode(nodeConfig);
  }

  /**
   * Updates an existing node with environmental enhancements
   * @param {string} nodeId - ID of node to update
   * @param {Object} updates - Updates to apply
   * @returns {WorldBuilder} This instance for chaining
   */
  updateNode(nodeId, updates) {
    if (!nodeId || typeof nodeId !== 'string') {
      throw new ValidationError('nodeId', nodeId, 'Node ID must be a non-empty string');
    }

    if (!updates || typeof updates !== 'object') {
      throw new ValidationError('updates', updates, 'Updates must be an object');
    }

    const nodeIndex = this.worldConfig.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) {
      throw new ValidationError('nodeId', nodeId, 'Node not found');
    }

    const existingNode = this.worldConfig.nodes[nodeIndex];

    try {
      // Create updated node with validation
      const updatedConfig = { ...existingNode, ...updates };
      const node = Node.fromJSON(updatedConfig);

      // Validate the updated node
      const validation = WorldValidator.validateSingleNode(node.toJSON());
      if (!validation.isValid) {
        const errorMessages = validation.errors.map(err => err.message).join('; ');
        throw new ValidationError('nodeValidation', updates, `Node validation failed: ${errorMessages}`);
      }

      // Update the node in storage
      this.worldConfig.nodes[nodeIndex] = node.toJSON();

      this._validatePreparationPhase('locationsDefined');
      return this;
    } catch (error) {
      throw new ValidationError('nodeUpdate', updates, `Node update failed: ${error.message}`);
    }
  }

  /**
   * Gets a node by ID
   * @param {string} nodeId - ID of node to retrieve
   * @returns {Object|null} Node data or null if not found
   */
  getNode(nodeId) {
    if (!nodeId || typeof nodeId !== 'string') {
      return null;
    }

    return this.worldConfig.nodes.find(n => n.id === nodeId) || null;
  }

  /**
   * Gets all nodes
   * @returns {Array} Array of all node data
   */
  getAllNodes() {
    return [...this.worldConfig.nodes];
  }

  /**
   * Migrates existing nodes to enhanced environmental format
   * @returns {WorldBuilder} This instance for chaining
   */
  migrateNodesToEnvironmentalFormat() {
    try {
      this.worldConfig.nodes = this.worldConfig.nodes.map(nodeData => {
        // Use NodeMigrationService to migrate old nodes
        const migratedNode = NodeMigrationService.migrateExistingNode(nodeData);
        return migratedNode;
      });

      this._validatePreparationPhase('locationsDefined');
      return this;
    } catch (error) {
      throw new ValidationError('nodeMigration', this.worldConfig.nodes, `Node migration failed: ${error.message}`);
    }
  }

  // Phase 3: Interaction creation methods (character capabilities)

  /**
   * Adds an interaction (character capability) to the world
   * @param {Object} interactionConfig - Interaction configuration
   * @returns {WorldBuilder} This instance for chaining
   */
  addInteraction(interactionConfig) {
    if (!this._canProceedToPhase('capabilitiesDefined')) {
      throw new Error('Cannot add interactions until at least one location is defined.');
    }

    if (!interactionConfig || typeof interactionConfig !== 'object') {
      throw new Error('Interaction configuration must be an object');
    }

    // Required fields for interactions
    const requiredFields = ['name', 'type', 'requirements', 'branches', 'effects', 'context'];
    for (const field of requiredFields) {
      if (!interactionConfig[field]) {
        throw new Error(`Interaction ${field} is required`);
      }
    }

    // Validate interaction type
    const validTypes = ['economic', 'resource_gathering', 'exploration', 'social', 'combat', 'crafting'];
    if (!validTypes.includes(interactionConfig.type)) {
      throw new Error(`Invalid interaction type. Must be one of: ${validTypes.join(', ')}`);
    }

    const interaction = {
      id: interactionConfig.id || this._generateId('interaction'),
      name: interactionConfig.name,
      type: interactionConfig.type,
      requirements: interactionConfig.requirements,
      branches: interactionConfig.branches,
      effects: interactionConfig.effects,
      context: interactionConfig.context,
      ...interactionConfig
    };

    this.worldConfig.interactions.push(interaction);
    this._validatePreparationPhase('capabilitiesDefined');
    return this;
  }

  /**
   * Adds an interaction from a template with customizations
   * @param {string} templateId - Template ID
   * @param {Object} customizations - Customizations to apply
   * @returns {WorldBuilder} This instance for chaining
   */
  addInteractionFromTemplate(templateId, customizations = {}) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    const template = this.templateManager.getTemplate('interactions', templateId);
    if (!template) {
      throw new Error(`Interaction template not found: ${templateId}`);
    }

    const interactionConfig = {
      ...template,
      ...customizations,
      id: customizations.id || this._generateId('interaction'),
      templateId: templateId,
      isTemplateInstance: true
    };

    return this.addInteraction(interactionConfig);
  }

  // Phase 4: Enhanced Character creation and management methods

  /**
   * Adds a character with enhanced validation and type support
   * @param {Object} characterConfig - Character configuration
   * @returns {WorldBuilder} This instance for chaining
   */
  addCharacter(characterConfig) {
    if (!this._canProceedToPhase('actorsDefined')) {
      throw new Error('Cannot add characters until locations and capabilities are defined.');
    }

    if (!characterConfig || typeof characterConfig !== 'object') {
      throw new Error('Character configuration must be an object');
    }

    // Create Character instance for enhanced validation
    let character;
    try {
      // Convert legacy format to new Character entity format
      const enhancedConfig = this._convertLegacyCharacterConfig(characterConfig);
      character = new Character(enhancedConfig);
    } catch (error) {
      throw new ValidationError('characterConfig', characterConfig, `Character creation failed: ${error.message}`);
    }

    // Validate against interactions still exist (legacy requirement)
    if (characterConfig.assignedInteractions && characterConfig.assignedInteractions.length > 0) {
      const interactionIds = new Set(this.worldConfig.interactions.map(i => i.id));
      for (const interactionId of characterConfig.assignedInteractions) {
        if (!interactionIds.has(interactionId)) {
          throw new Error(`Assigned interaction '${interactionId}' does not exist`);
        }
      }
    }

    // Convert Character entity back to plain object for storage
    const characterData = {
      ...character.toJSON(),
      // Preserve legacy fields for backwards compatibility
      assignedInteractions: characterConfig.assignedInteractions || []
    };

    // Assign LOD tier if not already specified
    if (!characterData.lodTier) {
      characterData.lodTier = this._assignLODForCharacter(characterData, characterConfig);
    }

    // Check for duplicates
    if (this.getCharacter(characterData.id)) {
      throw new ValidationError('characterId', characterData.id, 'Character with this ID already exists');
    }

    this.worldConfig.characters.push(characterData);
    this._validatePreparationPhase('actorsDefined');
    return this;
  }

  /**
   * Updates an existing character
   * @param {string} characterId - ID of character to update
   * @param {Object} updates - Updates to apply
   * @returns {WorldBuilder} This instance for chaining
   */
  updateCharacter(characterId, updates) {
    if (!characterId || typeof characterId !== 'string') {
      throw new ValidationError('characterId', characterId, 'Character ID must be a non-empty string');
    }

    if (!updates || typeof updates !== 'object') {
      throw new ValidationError('updates', updates, 'Updates must be an object');
    }

    const characterIndex = this.worldConfig.characters.findIndex(c => c.id === characterId);
    if (characterIndex === -1) {
      throw new ValidationError('characterId', characterId, 'Character not found');
    }

    const existingCharacter = this.worldConfig.characters[characterIndex];

    try {
      // Create updated character with validation
      const updatedConfig = { ...existingCharacter, ...updates };
      const character = Character.fromJSON(updatedConfig);

      // Validate the updated character
      const validation = character.validateAgainstType();
      if (!validation.success) {
        const errorMessages = validation.errors.map(err => err.message).join('; ');
        throw new ValidationError('characterValidation', updates, `Character validation failed: ${errorMessages}`);
      }

      // Update the character in storage
      this.worldConfig.characters[characterIndex] = {
        ...character.toJSON(),
        assignedInteractions: updatedConfig.assignedInteractions || existingCharacter.assignedInteractions || []
      };

      this._validatePreparationPhase('actorsDefined');
      return this;
    } catch (error) {
      throw new ValidationError('characterUpdate', updates, `Character update failed: ${error.message}`);
    }
  }

  /**
   * Deletes a character and handles cleanup
   * @param {string} characterId - ID of character to delete
   * @returns {WorldBuilder} This instance for chaining
   */
  deleteCharacter(characterId) {
    if (!characterId || typeof characterId !== 'string') {
      throw new ValidationError('characterId', characterId, 'Character ID must be a non-empty string');
    }

    const characterIndex = this.worldConfig.characters.findIndex(c => c.id === characterId);
    if (characterIndex === -1) {
      throw new ValidationError('characterId', characterId, 'Character not found');
    }

    // Remove character from characters array
    this.worldConfig.characters.splice(characterIndex, 1);

    // Clean up character assignments from nodes
    for (const nodeId in this.worldConfig.nodePopulations) {
      const characterIndex = this.worldConfig.nodePopulations[nodeId].indexOf(characterId);
      if (characterIndex !== -1) {
        this.worldConfig.nodePopulations[nodeId].splice(characterIndex, 1);
      }
    }

    // Revalidate phases that might be affected
    this._validatePreparationPhase('actorsDefined');
    this._validatePreparationPhase('actorsAssigned');

    return this;
  }

  /**
   * Gets a character by ID
   * @param {string} characterId - ID of character to retrieve
   * @returns {Object|null} Character data or null if not found
   */
  getCharacter(characterId) {
    if (!characterId || typeof characterId !== 'string') {
      return null;
    }

    return this.worldConfig.characters.find(c => c.id === characterId) || null;
  }

  /**
   * Gets all characters
   * @returns {Array} Array of all character data
   */
  getAllCharacters() {
    return [...this.worldConfig.characters];
  }

  /**
   * Searches characters by various criteria
   * @param {Object} searchCriteria - Search criteria
   * @returns {Array} Array of matching characters
   */
  searchCharacters(searchCriteria = {}) {
    let results = [...this.worldConfig.characters];

    // Filter by name (partial match, case-insensitive)
    if (searchCriteria.name) {
      const nameQuery = searchCriteria.name.toLowerCase();
      results = results.filter(character =>
        character.name && character.name.toLowerCase().includes(nameQuery)
      );
    }

    // Filter by character type
    if (searchCriteria.characterType) {
      results = results.filter(character => {
        const charType = character.characterType?.typeId || 'generic';
        return charType === searchCriteria.characterType;
      });
    }

    // Filter by character category
    if (searchCriteria.category) {
      results = results.filter(character => {
        const category = character.characterType?.category || 'npc';
        return category === searchCriteria.category;
      });
    }

    // Filter by age range
    if (searchCriteria.minAge !== undefined || searchCriteria.maxAge !== undefined) {
      results = results.filter(character => {
        const age = character.age || 25;
        const meetsMin = searchCriteria.minAge === undefined || age >= searchCriteria.minAge;
        const meetsMax = searchCriteria.maxAge === undefined || age <= searchCriteria.maxAge;
        return meetsMin && meetsMax;
      });
    }

    // Filter by level range
    if (searchCriteria.minLevel !== undefined || searchCriteria.maxLevel !== undefined) {
      results = results.filter(character => {
        const level = character.level || 1;
        const meetsMin = searchCriteria.minLevel === undefined || level >= searchCriteria.minLevel;
        const meetsMax = searchCriteria.maxLevel === undefined || level <= searchCriteria.maxLevel;
        return meetsMin && meetsMax;
      });
    }

    // Filter by attribute values
    if (searchCriteria.attributes) {
      results = results.filter(character => {
        if (!character.attributes) return false;

        return Object.entries(searchCriteria.attributes).every(([attr, criteria]) => {
          const value = character.attributes[attr];
          if (value === undefined) return false;

          if (typeof criteria === 'number') {
            return value >= criteria;
          }

          if (typeof criteria === 'object' && criteria !== null) {
            const meetsMin = criteria.min === undefined || value >= criteria.min;
            const meetsMax = criteria.max === undefined || value <= criteria.max;
            return meetsMin && meetsMax;
          }

          return true;
        });
      });
    }

    // Filter by skill values
    if (searchCriteria.skills) {
      results = results.filter(character => {
        if (!character.skills) return false;

        return Object.entries(searchCriteria.skills).every(([skill, criteria]) => {
          const value = character.skills[skill] || 0;

          if (typeof criteria === 'number') {
            return value >= criteria;
          }

          if (typeof criteria === 'object' && criteria !== null) {
            const meetsMin = criteria.min === undefined || value >= criteria.min;
            const meetsMax = criteria.max === undefined || value <= criteria.max;
            return meetsMin && meetsMax;
          }

          return true;
        });
      });
    }

    // Filter by assignment status
    if (searchCriteria.hasAssignments !== undefined) {
      results = results.filter(character => {
        const assignments = character.assignments;
        const hasAnyAssignments = assignments && Object.values(assignments).some(assignmentSet =>
          (Array.isArray(assignmentSet) && assignmentSet.length > 0) ||
          (assignmentSet && typeof assignmentSet === 'object' && assignmentSet.size > 0)
        );
        return hasAnyAssignments === searchCriteria.hasAssignments;
      });
    }

    // Filter by assigned to specific node
    if (searchCriteria.assignedToNode) {
      results = results.filter(character => {
        const nodePopulation = this.worldConfig.nodePopulations[searchCriteria.assignedToNode];
        return nodePopulation && nodePopulation.includes(character.id);
      });
    }

    // Filter by assigned interactions (legacy)
    if (searchCriteria.hasInteraction) {
      results = results.filter(character => {
        const interactions = character.assignedInteractions || [];
        return interactions.includes(searchCriteria.hasInteraction);
      });
    }

    // Filter by health range
    if (searchCriteria.minHealth !== undefined || searchCriteria.maxHealth !== undefined) {
      results = results.filter(character => {
        const health = character.health || 100;
        const meetsMin = searchCriteria.minHealth === undefined || health >= searchCriteria.minHealth;
        const meetsMax = searchCriteria.maxHealth === undefined || health <= searchCriteria.maxHealth;
        return meetsMin && meetsMax;
      });
    }

    return results;
  }

  /**
   * Filters characters by a custom filter function
   * @param {Function} filterFn - Filter function that takes a character and returns boolean
   * @returns {Array} Array of matching characters
   */
  filterCharacters(filterFn) {
    if (typeof filterFn !== 'function') {
      throw new ValidationError('filterFn', filterFn, 'Filter function must be a function');
    }

    return this.worldConfig.characters.filter(filterFn);
  }

  /**
   * Gets characters by character type
   * @param {string} characterTypeId - Character type ID to filter by
   * @returns {Array} Array of characters with the specified type
   */
  getCharactersByType(characterTypeId) {
    return this.searchCharacters({ characterType: characterTypeId });
  }

  /**
   * Gets characters by category
   * @param {string} category - Character category to filter by
   * @returns {Array} Array of characters with the specified category
   */
  getCharactersByCategory(category) {
    return this.searchCharacters({ category });
  }

  /**
   * Gets characters assigned to a specific node
   * @param {string} nodeId - Node ID to check
   * @returns {Array} Array of characters assigned to the node
   */
  getCharactersAtNode(nodeId) {
    const nodePopulation = this.worldConfig.nodePopulations[nodeId] || [];
    return nodePopulation.map(characterId => this.getCharacter(characterId)).filter(Boolean);
  }

  /**
   * Gets unassigned characters (not assigned to any node)
   * @returns {Array} Array of unassigned characters
   */
  getUnassignedCharacters() {
    const assignedCharacterIds = new Set();

    // Collect all assigned character IDs from node populations
    Object.values(this.worldConfig.nodePopulations).forEach(population => {
      population.forEach(characterId => assignedCharacterIds.add(characterId));
    });

    return this.worldConfig.characters.filter(character =>
      !assignedCharacterIds.has(character.id)
    );
  }

  /**
   * Validates a character against its type and world constraints
   * @param {Object} characterData - Character data to validate
   * @returns {Object} Validation result
   */
  validateCharacter(characterData) {
    const errors = [];
    const warnings = [];

    try {
      // Create character instance for validation
      const character = Character.fromJSON(characterData);

      // Validate against character type
      const typeValidation = character.validateAgainstType();
      errors.push(...typeValidation.errors);
      warnings.push(...typeValidation.warnings);

      // Validate assigned interactions exist (legacy)
      if (characterData.assignedInteractions) {
        const interactionIds = new Set(this.worldConfig.interactions.map(i => i.id));
        for (const interactionId of characterData.assignedInteractions) {
          if (!interactionIds.has(interactionId)) {
            errors.push({
              field: 'assignedInteractions',
              type: 'reference',
              message: `Assigned interaction '${interactionId}' does not exist`
            });
          }
        }
      }

      // Check for duplicate names (warning)
      const existingCharacter = this.worldConfig.characters.find(c =>
        c.id !== characterData.id && c.name === characterData.name
      );
      if (existingCharacter) {
        warnings.push({
          field: 'name',
          type: 'duplicate',
          message: `Character name '${characterData.name}' is already used by another character`
        });
      }

      // Validate LOD tier
      const lodTier = characterData.lodTier || 'background';
      const validTiers = ['hero', 'group', 'background'];
      if (!validTiers.includes(lodTier)) {
        errors.push({
          field: 'lodTier',
          type: 'invalid_value',
          message: `Invalid LOD tier '${lodTier}'. Must be one of: ${validTiers.join(', ')}`
        });
      }

      // Validate LOD tier assignment appropriateness (warning)
      const suggestedTier = this._assignLODForCharacter(characterData, {});
      if (lodTier !== suggestedTier) {
        warnings.push({
          field: 'lodTier',
          type: 'suboptimal_assignment',
          message: `Character '${characterData.name}' has LOD tier '${lodTier}' but properties suggest '${suggestedTier}'`
        });
      }

    } catch (error) {
      errors.push({
        field: 'character',
        type: 'creation',
        message: `Character creation failed: ${error.message}`
      });
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Bulk adds multiple characters with validation
   * @param {Array} charactersData - Array of character configurations
   * @returns {Object} Result with successes and failures
   */
  bulkAddCharacters(charactersData) {
    if (!Array.isArray(charactersData)) {
      throw new ValidationError('charactersData', charactersData, 'Characters data must be an array');
    }

    const results = {
      successes: [],
      failures: [],
      totalAttempted: charactersData.length
    };

    for (let i = 0; i < charactersData.length; i++) {
      const characterData = charactersData[i];

      try {
        this.addCharacter(characterData);
        results.successes.push({
          index: i,
          characterId: characterData.id || 'generated',
          characterName: characterData.name
        });
      } catch (error) {
        results.failures.push({
          index: i,
          characterData,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Gets character statistics and summary
   * @returns {Object} Statistics about characters in the world
   */
  getCharacterStatistics() {
    const characters = this.worldConfig.characters;

    if (characters.length === 0) {
      return {
        total: 0,
        byType: {},
        byCategory: {},
        levelDistribution: {},
        ageDistribution: {},
        assignmentStatus: {
          assigned: 0,
          unassigned: 0
        }
      };
    }

    const stats = {
      total: characters.length,
      byType: {},
      byCategory: {},
      levelDistribution: {},
      ageDistribution: {},
      assignmentStatus: {
        assigned: 0,
        unassigned: 0
      },
      lodDistribution: {
        hero: 0,
        group: 0,
        background: 0
      }
    };

    const assignedCharacterIds = new Set();
    Object.values(this.worldConfig.nodePopulations).forEach(population => {
      population.forEach(characterId => assignedCharacterIds.add(characterId));
    });

    characters.forEach(character => {
      // Type distribution
      const type = character.characterType?.typeId || 'generic';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Category distribution
      const category = character.characterType?.category || 'npc';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Level distribution
      const level = character.level || 1;
      const levelRange = `${Math.floor(level / 5) * 5}-${Math.floor(level / 5) * 5 + 4}`;
      stats.levelDistribution[levelRange] = (stats.levelDistribution[levelRange] || 0) + 1;

      // Age distribution
      const age = character.age || 25;
      const ageRange = `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 9}`;
      stats.ageDistribution[ageRange] = (stats.ageDistribution[ageRange] || 0) + 1;

      // Assignment status
      if (assignedCharacterIds.has(character.id)) {
        stats.assignmentStatus.assigned++;
      } else {
        stats.assignmentStatus.unassigned++;
      }

      // LOD tier distribution
      const lodTier = character.lodTier || 'background';
      if (stats.lodDistribution.hasOwnProperty(lodTier)) {
        stats.lodDistribution[lodTier]++;
      }
    });

    return stats;
  }

  /**
   * Promotes a character to a higher LOD tier
   * @param {string} characterId - ID of character to promote
   * @param {string} reason - Reason for promotion
   * @returns {WorldBuilder} This instance for chaining
   */
  promoteCharacter(characterId, reason = 'manual') {
    const character = this.worldConfig.characters.find(c => c.id === characterId);
    if (!character) {
      throw new ValidationError('characterId', characterId, 'Character not found');
    }

    const currentTier = character.lodTier || 'background';
    const promotionResult = this.lodManager.promoteCharacter(characterId, currentTier, 'higher', reason);

    if (promotionResult.success) {
      character.lodTier = promotionResult.toTier;
      console.log(`Promoted character ${character.name} from ${currentTier} to ${character.lodTier} (${reason})`);
    } else {
      throw new ValidationError('promotion', { characterId, currentTier }, promotionResult.error);
    }

    return this;
  }

  /**
   * Demotes a character to a lower LOD tier
   * @param {string} characterId - ID of character to demote
   * @param {string} reason - Reason for demotion
   * @returns {WorldBuilder} This instance for chaining
   */
  demoteCharacter(characterId, reason = 'manual') {
    const character = this.worldConfig.characters.find(c => c.id === characterId);
    if (!character) {
      throw new ValidationError('characterId', characterId, 'Character not found');
    }

    const currentTier = character.lodTier || 'background';
    const demotionResult = this.lodManager.demoteCharacter(characterId, currentTier, 'lower', reason);

    if (demotionResult.success) {
      character.lodTier = demotionResult.toTier;
      console.log(`Demoted character ${character.name} from ${currentTier} to ${character.lodTier} (${reason})`);
    } else {
      throw new ValidationError('demotion', { characterId, currentTier }, demotionResult.error);
    }

    return this;
  }

  /**
   * Sets a specific LOD tier for a character
   * @param {string} characterId - ID of character
   * @param {string} lodTier - LOD tier to set ('hero', 'group', 'background')
   * @param {string} reason - Reason for tier change
   * @returns {WorldBuilder} This instance for chaining
   */
  setCharacterLODTier(characterId, lodTier, reason = 'manual') {
    const validTiers = ['hero', 'group', 'background'];
    if (!validTiers.includes(lodTier)) {
      throw new ValidationError('lodTier', lodTier, `Invalid LOD tier. Must be one of: ${validTiers.join(', ')}`);
    }

    const character = this.worldConfig.characters.find(c => c.id === characterId);
    if (!character) {
      throw new ValidationError('characterId', characterId, 'Character not found');
    }

    const previousTier = character.lodTier || 'background';
    character.lodTier = lodTier;

    console.log(`Set character ${character.name} LOD tier from ${previousTier} to ${lodTier} (${reason})`);
    return this;
  }

  /**
   * Gets characters by LOD tier
   * @param {string} lodTier - LOD tier to filter by
   * @returns {Array} Array of characters with the specified LOD tier
   */
  getCharactersByLODTier(lodTier) {
    const validTiers = ['hero', 'group', 'background'];
    if (!validTiers.includes(lodTier)) {
      throw new ValidationError('lodTier', lodTier, `Invalid LOD tier. Must be one of: ${validTiers.join(', ')}`);
    }

    return this.worldConfig.characters.filter(character => (character.lodTier || 'background') === lodTier);
  }

  /**
   * Gets LOD tier distribution statistics
   * @returns {Object} LOD tier distribution
   */
  getLODTierDistribution() {
    const distribution = {
      hero: 0,
      group: 0,
      background: 0,
      total: this.worldConfig.characters.length
    };

    this.worldConfig.characters.forEach(character => {
      const tier = character.lodTier || 'background';
      if (distribution.hasOwnProperty(tier)) {
        distribution[tier]++;
      }
    });

    return distribution;
  }

  /**
   * Automatically assigns LOD tiers to all characters based on their properties
   * @returns {WorldBuilder} This instance for chaining
   */
  autoAssignLODTiers() {
    console.log('Auto-assigning LOD tiers to characters...');

    let heroCount = 0;
    let groupCount = 0;
    let backgroundCount = 0;

    this.worldConfig.characters.forEach(character => {
      const newTier = this._assignLODForCharacter(character, {});
      const oldTier = character.lodTier || 'none';

      if (newTier !== oldTier) {
        character.lodTier = newTier;
        console.log(`Assigned ${character.name} to ${newTier} tier (was ${oldTier})`);
      }

      // Count assignments
      switch (newTier) {
        case 'hero': heroCount++; break;
        case 'group': groupCount++; break;
        case 'background': backgroundCount++; break;
        default: backgroundCount++; break; // Default to background for unknown tiers
      }
    });

    console.log(`LOD tier assignment complete: ${heroCount}H / ${groupCount}G / ${backgroundCount}B`);
    return this;
  }

  /**
   * Adds a character from a template with customizations
   * @param {string} templateId - Template ID
   * @param {Object} customizations - Customizations to apply
   * @returns {WorldBuilder} This instance for chaining
   */
  addCharacterFromTemplate(templateId, customizations = {}) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    const template = this.templateManager.getTemplate('characters', templateId);
    if (!template) {
      throw new Error(`Character template not found: ${templateId}`);
    }

    const characterConfig = {
      ...template,
      ...customizations,
      id: customizations.id || this._generateId('character'),
      templateId: templateId,
      isTemplateInstance: true
    };

    return this.addCharacter(characterConfig);
  }

  /**
   * Automatically assign interactions to characters based on their capabilities
   * @returns {WorldBuilder} This instance for chaining
   */
  autoAssignInteractionsToCharacters() {
    if (!this._canProceedToPhase('actorsAssigned')) {
      throw new Error('Cannot assign interactions until locations, capabilities, and actors are defined.');
    }

    console.log('Auto-assigning interactions to characters...');

    // For each character, assign a subset of available interactions
    this.worldConfig.characters.forEach(character => {
      // Skip if character already has interaction assignments
      if (character.assignments?.interactions?.size > 0) {
        console.log(`Character ${character.name} already has ${character.assignments.interactions.size} interaction assignments`);
        return;
      }

      // Initialize assignments.interactions if it doesn't exist
      if (!character.assignments) {
        character.assignments = {
          nodes: new Set(),
          interactions: new Set(),
          quests: new Set(),
          settlements: new Set(),
          factions: new Set(),
          investments: new Set()
        };
      }

      // Ensure assignments.interactions is a Set (handle both Set and array formats)
      if (!character.assignments) {
        character.assignments = {
          nodes: new Set(),
          interactions: new Set(),
          quests: new Set(),
          settlements: new Set(),
          factions: new Set(),
          investments: new Set()
        };
      }

      // Convert array to Set if necessary
      if (!character.assignments.interactions) {
        character.assignments.interactions = new Set();
      } else if (Array.isArray(character.assignments.interactions)) {
        character.assignments.interactions = new Set(character.assignments.interactions);
      } else if (!(character.assignments.interactions instanceof Set)) {
        // Handle other formats by creating a new Set
        character.assignments.interactions = new Set();
      }

      // Get all available interactions
      const availableInteractions = [...this.worldConfig.interactions];

      // Determine how many interactions to assign (1-3 based on character level/type)
      const maxAssignments = Math.min(3, Math.max(1, Math.floor(character.level / 2) || 1));
      const numToAssign = Math.min(maxAssignments, availableInteractions.length);

      // Randomly select interactions to assign
      const shuffled = [...availableInteractions].sort(() => 0.5 - Math.random());
      const selectedInteractions = shuffled.slice(0, numToAssign);

      // Assign interactions to character using the correct assignment system
      selectedInteractions.forEach(interaction => {
        character.assignments.interactions.add(interaction.id);
      });

      console.log(`Assigned ${selectedInteractions.length} interactions to character ${character.name}:`,
        selectedInteractions.map(i => i.name).join(', '));
    });

    this._validatePreparationPhase('actorsAssigned');
    return this;
  }

  // Phase 5: Node population methods (assign characters to nodes)

  /**
   * Assigns a character to a specific node
   * @param {string} characterId - Character ID
   * @param {string} nodeId - Node ID
   * @returns {WorldBuilder} This instance for chaining
   */
  assignCharacterToNode(characterId, nodeId) {
    if (!this._canProceedToPhase('actorsAssigned')) {
      throw new Error('Cannot assign actors until both locations and actors are defined.');
    }

    // Validate character exists
    const character = this.worldConfig.characters.find(c => c.id === characterId);
    if (!character) {
      throw new Error(`Character '${characterId}' does not exist`);
    }

    // Validate node exists
    const node = this.worldConfig.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node '${nodeId}' does not exist`);
    }

    // Initialize node population if needed
    if (!this.worldConfig.nodePopulations[nodeId]) {
      this.worldConfig.nodePopulations[nodeId] = [];
    }

    // Add character to node if not already there
    if (!this.worldConfig.nodePopulations[nodeId].includes(characterId)) {
      this.worldConfig.nodePopulations[nodeId].push(characterId);
    }

    this._validatePreparationPhase('actorsAssigned');
    return this;
  }

  // Preparation Phase Validation

  /**
   * Validates a specific preparation phase.
   * @param {string} phaseName - The name of the phase to validate.
   * @returns {boolean} True if the phase is valid.
   */
  validatePreparationPhase(phaseName) {
    return this._validatePreparationPhase(phaseName);
  }

  /**
   * Checks if the builder can proceed to a specific phase.
   * @param {string} phaseName - The name of the phase to check.
   * @returns {boolean} True if the builder can proceed.
   * @private
   */
  _canProceedToPhase(phaseName) {
    const readiness = this.worldConfig.simulationReadiness;
    switch (phaseName) {
      case 'worldFoundationDefined':
        return true;
      case 'locationsDefined':
        return readiness.worldFoundationDefined;
      case 'capabilitiesDefined':
        return readiness.locationsDefined;
      case 'actorsDefined':
        return readiness.capabilitiesDefined;
      case 'actorsAssigned':
        return readiness.actorsDefined;
      case 'readyForSimulation':
        return readiness.actorsAssigned;
      default:
        return false;
    }
  }

  // Template management

  /**
   * Saves current world configuration as a template
   * @param {string} type - Template type ('world', 'nodes', 'interactions', 'characters')
   * @param {string} name - Template name
   * @param {string} description - Template description
   * @returns {Object} Created template
   */
  saveAsTemplate(type, name, description) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    if (!name || !description) {
      throw new Error('Template name and description are required');
    }

    let templateData;

    switch (type) {
      case 'world':
        templateData = {
          id: this._generateId('world_template'),
          name,
          description,
          type: 'world',
          version: '1.0.0',
          tags: ['world', 'custom', 'mappless'],
          worldConfig: { ...this.worldConfig },
          metadata: {
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            author: 'User',
            type: 'mappless-world'
          }
        };
        break;
      case 'nodes':
        templateData = this.worldConfig.nodes.map((node, index) => ({
          ...node,
          id: `${name}_node_${index}`,
          name: `${name} Node ${index + 1}`,
          description: `${description} - Node template`,
          type: 'node',
          tags: ['node', 'custom', 'world-generated']
        }));
        break;
      case 'interactions':
        templateData = this.worldConfig.interactions.map((interaction, index) => ({
          ...interaction,
          id: `${name}_interaction_${index}`,
          name: `${name} Interaction ${index + 1}`,
          description: `${description} - Interaction template`,
          type: 'interaction',
          tags: ['interaction', 'custom', 'world-generated']
        }));
        break;
      case 'characters':
        templateData = this.worldConfig.characters.map((character, index) => ({
          ...character,
          id: `${name}_character_${index}`,
          name: `${name} Character ${index + 1}`,
          description: `${description} - Character template`,
          type: 'character',
          tags: ['character', 'custom', 'world-generated']
        }));
        break;
      default:
        throw new Error(`Invalid template type: ${type}`);
    }

    if (type === 'world') {
      this.templateManager.addTemplate('worlds', templateData);
      return templateData;
    } else {
      const templates = [];
      for (const template of templateData) {
        this.templateManager.addTemplate(type, template);
        templates.push(template);
      }
      return templates;
    }
  }

  /**
   * Loads world configuration from a template
   * @param {string} templateId - Template ID
   * @returns {WorldBuilder} This instance for chaining
   */
  loadFromTemplate(templateId) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    const template = this.templateManager.getTemplate('worlds', templateId);
    if (!template) {
      throw new Error(`World template not found: ${templateId}`);
    }

    if (!template.worldConfig) {
      throw new Error('Template does not contain world configuration');
    }

    // Load configuration from template
    this.worldConfig = {
      ...template.worldConfig,
      templateId: templateId,
      isTemplateInstance: true
    };

    // Validate all preparation phases
    Object.keys(this.worldConfig.simulationReadiness).forEach(phase => {
      this._validatePreparationPhase(phase);
    });

    return this;
  }

  // Simulation Handoff

  /**
   * Prepares the world for simulation and returns simulation-optimized data structures.
   * This is the exclusive handoff point from the builder to the simulation engine.
   * @returns {Object} Simulation-ready world data.
   */
  prepareForSimulation() {
    if (!this.validate().isValid) {
      throw new Error('World configuration is not valid for simulation.');
    }

    // Auto-assign interactions to characters if not already assigned
    this.autoAssignInteractionsToCharacters();

    // Create simulation-optimized data structures
    const simulationNodes = new Map(this.worldConfig.nodes.map(node => [node.id, { ...node, characters: [], contentInteractions: [] }]));
    const simulationCharacters = new Map(this.worldConfig.characters.map(char => {
      // Ensure character assignments are Sets, not arrays
      const processedChar = { ...char };
      
      // Convert assignments to Sets if they're arrays
      if (processedChar.assignments) {
        processedChar.assignments = {
          nodes: processedChar.assignments.nodes instanceof Set ? 
            processedChar.assignments.nodes : 
            new Set(processedChar.assignments.nodes || []),
          interactions: processedChar.assignments.interactions instanceof Set ? 
            processedChar.assignments.interactions : 
            new Set(processedChar.assignments.interactions || []),
          quests: processedChar.assignments.quests instanceof Set ? 
            processedChar.assignments.quests : 
            new Set(processedChar.assignments.quests || []),
          settlements: processedChar.assignments.settlements instanceof Set ? 
            processedChar.assignments.settlements : 
            new Set(processedChar.assignments.settlements || []),
          factions: processedChar.assignments.factions instanceof Set ? 
            processedChar.assignments.factions : 
            new Set(processedChar.assignments.factions || []),
          investments: processedChar.assignments.investments instanceof Set ? 
            processedChar.assignments.investments : 
            new Set(processedChar.assignments.investments || [])
        };
      } else {
        // Initialize empty assignments if missing
        processedChar.assignments = {
          nodes: new Set(),
          interactions: new Set(),
          quests: new Set(),
          settlements: new Set(),
          factions: new Set(),
          investments: new Set()
        };
      }
      
      return [char.id, processedChar];
    }));
    const simulationInteractions = new Map(this.worldConfig.interactions.map(i => [i.id, { ...i }]));

    // Process settlements with proper population structures
    const simulationSettlements = new Map();
    if (this.worldConfig.settlements) {
      this.worldConfig.settlements.forEach(settlement => {
        // Ensure settlement has proper population structure
        if (!settlement.population || typeof settlement.population !== 'object') {
          // Calculate from available data
          let totalPop = 100; // default
          if (settlement.populationGroups) {
            totalPop = settlement.populationGroups.reduce((sum, g) => sum + (g.count || g.size || 0), 0) || 100;
          } else if (settlement.assignedCharacters && Array.isArray(settlement.assignedCharacters)) {
            totalPop = settlement.assignedCharacters.length;
          }

          settlement.population = {
            total: totalPop,
            groups: settlement.populationGroups || [],
            lastUpdated: 0
          };

          console.log(`WorldBuilder: Initialized population structure for settlement ${settlement.name}: ${totalPop} total`);
        } else if (typeof settlement.population === 'number') {
          // Convert simple number to object structure
          settlement.population = {
            total: settlement.population,
            groups: settlement.populationGroups || [],
            lastUpdated: 0
          };
        }

        simulationSettlements.set(settlement.id, { ...settlement });
      });
    }
    for (const [nodeId, characterIds] of Object.entries(this.worldConfig.nodePopulations)) {
      const node = simulationNodes.get(nodeId);
      if (node) {
        // Add character references
        node.characters = characterIds.map(id => simulationCharacters.get(id)).filter(Boolean);

        // Populate contentInteractions from assigned characters
        node.contentInteractions = [];

        // Find all characters assigned to this node
        characterIds.forEach(characterId => {
          const character = simulationCharacters.get(characterId);
          if (character && character.assignments?.interactions) {
            // Get the actual interaction objects from the assigned interaction IDs
            const characterInteractions = Array.from(character.assignments.interactions)
              .map(interactionId => simulationInteractions.get(interactionId))
              .filter(Boolean); // Remove any null/undefined interactions

            // Add to node's content interactions (avoid duplicates)
            characterInteractions.forEach(interaction => {
              if (!node.contentInteractions.some(existing => existing.id === interaction.id)) {
                node.contentInteractions.push(interaction);
              }
            });
          }
        });
      }
    }

    return {
      worldProperties: {
        name: this.worldConfig.name,
        description: this.worldConfig.description,
        rules: this.worldConfig.rules,
        initialConditions: this.worldConfig.initialConditions,
      },
      nodes: simulationNodes,
      characters: simulationCharacters,
      interactions: simulationInteractions,
      lodManager: this.lodManager, // Include LOD manager for simulation
      lodDistribution: this.getLODTierDistribution(), // Include LOD distribution stats
      simulationMetadata: {
        preparedAt: new Date().toISOString(),
        source: 'WorldBuilder',
        worldId: `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: '2.0.0',
        pipelineVersion: '1.0.0',
        lodEnabled: true, // Indicate LOD system is active
        lodTiers: {
          hero: simulationCharacters.size ? Array.from(simulationCharacters.values()).filter(c => c.lodTier === 'hero').length : 0,
          group: simulationCharacters.size ? Array.from(simulationCharacters.values()).filter(c => c.lodTier === 'group').length : 0,
          background: simulationCharacters.size ? Array.from(simulationCharacters.values()).filter(c => c.lodTier === 'background').length : 0
        }
      },
    };
  }

  /**
   * Validates the entire world configuration
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];
    const phaseResults = {};

    // Validate each preparation phase
    Object.keys(this.worldConfig.simulationReadiness).forEach(phase => {
      const phaseValid = this._validatePreparationPhase(phase);
      phaseResults[phase] = phaseValid;
      if (!phaseValid) {
        errors.push(`Preparation phase '${phase}' is not complete.`);
      }
    });

    // Additional cross-phase validations
    if (this.worldConfig.characters.length > 0 && this.worldConfig.nodes.length === 0) {
      errors.push('Characters exist but no nodes defined');
    }

    if (this.worldConfig.interactions.length > 0 && this.worldConfig.characters.length === 0) {
      warnings.push('Interactions defined but no characters to use them');
    }

    // LOD-specific validations
    if (this.worldConfig.characters.length > 0) {
      const lodDistribution = this.getLODTierDistribution();

      // Check for reasonable LOD distribution
      const heroPercentage = (lodDistribution.hero / lodDistribution.total) * 100;

      // Warn if too many characters are in hero tier (performance concern)
      if (heroPercentage > 20) {
        warnings.push(`High hero tier percentage (${heroPercentage.toFixed(1)}%) may impact performance. Consider demoting some characters to group or background tier.`);
      }

      // Warn if no hero-tier characters exist (may indicate incomplete setup)
      if (lodDistribution.hero === 0 && lodDistribution.total > 5) {
        warnings.push('No hero-tier characters found. Consider promoting key characters for detailed simulation.');
      }

      // Check for LOD tier consistency
      const inconsistentCharacters = this.worldConfig.characters.filter(character => {
        const currentTier = character.lodTier || 'background';
        const suggestedTier = this._assignLODForCharacter(character, {});
        return currentTier !== suggestedTier;
      });

      if (inconsistentCharacters.length > 0) {
        warnings.push(`${inconsistentCharacters.length} characters have LOD tiers that don't match their properties. Consider running autoAssignLODTiers().`);
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      simulationReadiness: phaseResults,
      completeness: this._calculateCompleteness()
    };
  }

  /**
   * Resets the world builder to initial state
   * @returns {WorldBuilder} This instance for chaining
   */
  reset() {
    this.worldConfig = {
      name: null,
      description: null,
      rules: null,
      initialConditions: null,
      nodes: [],
      interactions: [],
      characters: [],
      nodePopulations: {},
      isComplete: false,
      isValid: false,
      simulationReadiness: {
        worldFoundationDefined: false,
        locationsDefined: false,
        capabilitiesDefined: false,
        actorsDefined: false,
        actorsAssigned: false,
        readyForSimulation: false
      }
    };
    return this;
  }

  // Private helper methods

  /**
   * Internal validation logic for each preparation phase.
   * @param {string} phaseName - The name of the phase to validate.
   * @returns {boolean} True if the phase is valid.
   * @private
   */
  _validatePreparationPhase(phaseName) {
    const readiness = this.worldConfig.simulationReadiness;
    let isValid = false;

    switch (phaseName) {
      case 'worldFoundationDefined':
        isValid = !!(this.worldConfig.name && this.worldConfig.description && this.worldConfig.rules && this.worldConfig.initialConditions);
        break;
      case 'locationsDefined':
        isValid = readiness.worldFoundationDefined && this.worldConfig.nodes.length > 0;
        break;
      case 'capabilitiesDefined':
        isValid = readiness.locationsDefined && this.worldConfig.interactions.length > 0;
        break;
      case 'actorsDefined':
        isValid = readiness.capabilitiesDefined && this.worldConfig.characters.length > 0;
        break;
      case 'actorsAssigned':
        isValid = readiness.actorsDefined && this.worldConfig.nodes.every(node => this.worldConfig.nodePopulations[node.id] && this.worldConfig.nodePopulations[node.id].length > 0);
        break;
      case 'readyForSimulation':
        isValid = readiness.actorsAssigned;
        break;
      default:
        isValid = false;
    }

    this.worldConfig.simulationReadiness[phaseName] = isValid;
    return isValid;
  }

  /**
   * Calculates completeness score based on preparation phases.
   * @returns {number} Completeness score between 0 and 1.
   * @private
   */
  _calculateCompleteness() {
    const validPhases = Object.values(this.worldConfig.simulationReadiness).filter(Boolean).length;
    return validPhases / Object.keys(this.worldConfig.simulationReadiness).length;
  }

  /**
   * Generates a unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Generated ID
   */
  _generateId(prefix = 'item') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Converts legacy character config to new Character entity format
   * @param {Object} characterConfig - Legacy character configuration
   * @returns {Object} Enhanced character configuration
   * @private
   */
  _convertLegacyCharacterConfig(characterConfig) {
    // Start with the original config
    const enhancedConfig = { ...characterConfig };

    // Ensure ID exists
    if (!enhancedConfig.id) {
      enhancedConfig.id = this._generateId('character');
    }

    // Set default character type if not specified
    if (!enhancedConfig.characterType && !enhancedConfig.characterTypeId) {
      enhancedConfig.characterTypeId = 'generic';
    }

    // Ensure required attributes exist with defaults
    if (!enhancedConfig.attributes) {
      enhancedConfig.attributes = {};
    }

    const requiredAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const attr of requiredAttributes) {
      if (typeof enhancedConfig.attributes[attr] !== 'number') {
        enhancedConfig.attributes[attr] = 10; // Default attribute value
      }
    }

    // Ensure health exists
    if (enhancedConfig.health === undefined) {
      enhancedConfig.health = 100;
    }

    // Convert assignedInteractions to assignments format if needed
    if (characterConfig.assignedInteractions && characterConfig.assignedInteractions.length > 0) {
      if (!enhancedConfig.assignedInteractionIds) {
        enhancedConfig.assignedInteractionIds = [...characterConfig.assignedInteractions];
      }
    }

    // Ensure other defaults
    if (!enhancedConfig.name) {
      enhancedConfig.name = 'Unnamed Character';
    }

    if (enhancedConfig.age === undefined) {
      enhancedConfig.age = 25;
    }

    if (enhancedConfig.level === undefined) {
      enhancedConfig.level = 1;
    }

    // Ensure consciousness exists
    if (!enhancedConfig.consciousness) {
      enhancedConfig.consciousness = {
        frequency: 40,
        coherence: 0.5
      };
    }

    return enhancedConfig;
  }

  /**
   * Assigns an appropriate LOD tier to a character based on its properties and world context
   * @param {Object} characterData - Character data
   * @param {Object} originalConfig - Original character configuration
   * @returns {string} LOD tier ('hero', 'group', or 'background')
   * @private
   */
  _assignLODForCharacter(characterData, originalConfig) {
    // If LOD tier is explicitly specified in config, use it
    if (originalConfig.lodTier) {
      const validTiers = ['hero', 'group', 'background'];
      if (validTiers.includes(originalConfig.lodTier)) {
        return originalConfig.lodTier;
      }
    }

    // Determine LOD tier based on character properties and world context
    const level = characterData.level || 1;
    const characterType = characterData.characterType?.category || 'npc';
    const hasSpecialAttributes = this._hasSpecialAttributes(characterData);

    // Hero tier criteria: High-level characters with special attributes or specific types
    if (level >= 5 || characterType === 'player' || hasSpecialAttributes) {
      return 'hero';
    }

    // Group tier criteria: Mid-level characters that could be important
    if (level >= 2 && level <= 4) {
      return 'group';
    }

    // Background tier: Default for most characters
    return 'background';
  }

  /**
   * Checks if a character has special attributes that warrant hero-tier processing
   * @param {Object} characterData - Character data
   * @returns {boolean} True if character has special attributes
   * @private
   */
  _hasSpecialAttributes(characterData) {
    // Check for high attribute scores
    const attributes = characterData.attributes || {};
    const highAttributes = Object.values(attributes).filter(attr => attr >= 15);
    if (highAttributes.length >= 2) {
      return true;
    }

    // Check for unique character types or special designations
    const specialTypes = ['leader', 'quest_giver', 'antagonist', 'protagonist'];
    if (specialTypes.includes(characterData.characterType?.typeId)) {
      return true;
    }

    // Check for characters with complex consciousness
    const consciousness = characterData.consciousness || {};
    if (consciousness.frequency > 60 || consciousness.coherence > 0.7) {
      return true;
    }

    return false;
  }
}

export default WorldBuilder;
