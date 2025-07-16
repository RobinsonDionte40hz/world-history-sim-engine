// src/application/use-cases/world-builder/WorldBuilder.js

import Character from '../../../domain/entities/Character.js';
import Node from '../../../domain/entities/Node.js';
import Interaction from '../../../domain/entities/Interaction.js';
import HistoricalEvent from '../../../domain/entities/HistoricalEvent.js';

/**
 * WorldBuilder class for creating and managing world configurations
 * Integrates with the template system for flexible content creation
 */
class WorldBuilder {
  constructor(templateManager) {
    if (!templateManager) {
      throw new Error('TemplateManager is required for WorldBuilder');
    }
    
    this.templateManager = templateManager;
    this.worldConfig = {
      dimensions: null,
      rules: null,
      initialConditions: null,
      nodes: [],
      characters: [],
      interactions: [],
      events: [],
      groups: [],
      items: [],
      isComplete: false,
      isValid: false
    };
  }

  // Configuration methods
  setDimensions(width, height, depth = null) {
    if (typeof width !== 'number' || width <= 0) {
      throw new Error('Width must be a positive number');
    }
    if (typeof height !== 'number' || height <= 0) {
      throw new Error('Height must be a positive number');
    }
    if (depth !== null && (typeof depth !== 'number' || depth <= 0)) {
      throw new Error('Depth must be null or a positive number');
    }

    this.worldConfig.dimensions = {
      width,
      height,
      ...(depth && { depth })
    };
    
    this._updateValidationStatus();
    return this;
  }

  setRules(rules) {
    if (!rules || typeof rules !== 'object') {
      throw new Error('Rules must be an object');
    }

    this.worldConfig.rules = {
      physics: rules.physics || {},
      interactions: rules.interactions || {},
      evolution: rules.evolution || {}
    };
    
    this._updateValidationStatus();
    return this;
  }

  setInitialConditions(conditions) {
    if (!conditions || typeof conditions !== 'object') {
      throw new Error('Initial conditions must be an object');
    }

    this.worldConfig.initialConditions = {
      characterCount: conditions.characterCount || 0,
      resourceTypes: conditions.resourceTypes || [],
      startingResources: conditions.startingResources || {},
      timeScale: conditions.timeScale || 1
    };
    
    this._updateValidationStatus();
    return this;
  }

  // Template-based content creation methods
  addNodeFromTemplate(templateId, customizations = {}) {
    const template = this.templateManager.getTemplate('nodes', templateId);
    if (!template) {
      throw new Error(`Node template not found: ${templateId}`);
    }

    const nodeConfig = this._applyCustomizations(template, customizations);
    const node = new Node({
      ...nodeConfig,
      id: this._generateInstanceId(templateId),
      templateId: templateId,
      isTemplateInstance: true
    });

    this.worldConfig.nodes.push(node);
    this._updateValidationStatus();
    return node;
  }

  addCharacterFromTemplate(templateId, customizations = {}) {
    const template = this.templateManager.getTemplate('characters', templateId);
    if (!template) {
      throw new Error(`Character template not found: ${templateId}`);
    }

    const characterConfig = this._applyCustomizations(template, customizations);
    const character = new Character({
      ...characterConfig,
      id: this._generateInstanceId(templateId),
      templateId: templateId,
      isTemplateInstance: true
    });

    this.worldConfig.characters.push(character);
    this._updateValidationStatus();
    return character;
  }

  addInteractionFromTemplate(templateId, customizations = {}) {
    const template = this.templateManager.getTemplate('interactions', templateId);
    if (!template) {
      throw new Error(`Interaction template not found: ${templateId}`);
    }

    const interactionConfig = this._applyCustomizations(template, customizations);
    const interaction = new Interaction({
      ...interactionConfig,
      id: this._generateInstanceId(templateId),
      templateId: templateId,
      isTemplateInstance: true
    });

    this.worldConfig.interactions.push(interaction);
    this._updateValidationStatus();
    return interaction;
  }

  addEventFromTemplate(templateId, customizations = {}) {
    const template = this.templateManager.getTemplate('events', templateId);
    if (!template) {
      throw new Error(`Event template not found: ${templateId}`);
    }

    const eventConfig = this._applyCustomizations(template, customizations);
    const event = new HistoricalEvent({
      ...eventConfig,
      id: this._generateInstanceId(templateId),
      templateId: templateId,
      isTemplateInstance: true
    });

    this.worldConfig.events.push(event);
    this._updateValidationStatus();
    return event;
  }

  addGroupFromTemplate(templateId, customizations = {}) {
    const template = this.templateManager.getTemplate('groups', templateId);
    if (!template) {
      throw new Error(`Group template not found: ${templateId}`);
    }

    const groupConfig = this._applyCustomizations(template, customizations);
    const group = {
      ...groupConfig,
      id: this._generateInstanceId(templateId),
      templateId: templateId,
      isTemplateInstance: true
    };

    this.worldConfig.groups.push(group);
    this._updateValidationStatus();
    return group;
  }

  addItemFromTemplate(templateId, customizations = {}) {
    const template = this.templateManager.getTemplate('items', templateId);
    if (!template) {
      throw new Error(`Item template not found: ${templateId}`);
    }

    const itemConfig = this._applyCustomizations(template, customizations);
    const item = {
      ...itemConfig,
      id: this._generateInstanceId(templateId),
      templateId: templateId,
      isTemplateInstance: true
    };

    this.worldConfig.items.push(item);
    this._updateValidationStatus();
    return item;
  }

  // Direct content creation methods
  addNode(nodeConfig) {
    if (!nodeConfig || typeof nodeConfig !== 'object') {
      throw new Error('Node configuration must be an object');
    }

    const node = new Node({
      ...nodeConfig,
      id: nodeConfig.id || this._generateId('node')
    });

    this.worldConfig.nodes.push(node);
    this._updateValidationStatus();
    return node;
  }

  addCharacter(characterConfig) {
    if (!characterConfig || typeof characterConfig !== 'object') {
      throw new Error('Character configuration must be an object');
    }

    const character = new Character({
      ...characterConfig,
      id: characterConfig.id || this._generateId('character')
    });

    this.worldConfig.characters.push(character);
    this._updateValidationStatus();
    return character;
  }

  addInteraction(interactionConfig) {
    if (!interactionConfig || typeof interactionConfig !== 'object') {
      throw new Error('Interaction configuration must be an object');
    }

    const interaction = new Interaction({
      ...interactionConfig,
      id: interactionConfig.id || this._generateId('interaction')
    });

    this.worldConfig.interactions.push(interaction);
    this._updateValidationStatus();
    return interaction;
  }

  addEvent(eventConfig) {
    if (!eventConfig || typeof eventConfig !== 'object') {
      throw new Error('Event configuration must be an object');
    }

    const event = new HistoricalEvent({
      ...eventConfig,
      id: eventConfig.id || this._generateId('event')
    });

    this.worldConfig.events.push(event);
    this._updateValidationStatus();
    return event;
  }

  addGroup(groupConfig) {
    if (!groupConfig || typeof groupConfig !== 'object') {
      throw new Error('Group configuration must be an object');
    }

    const group = {
      ...groupConfig,
      id: groupConfig.id || this._generateId('group')
    };

    this.worldConfig.groups.push(group);
    this._updateValidationStatus();
    return group;
  }

  addItem(itemConfig) {
    if (!itemConfig || typeof itemConfig !== 'object') {
      throw new Error('Item configuration must be an object');
    }

    const item = {
      ...itemConfig,
      id: itemConfig.id || this._generateId('item')
    };

    this.worldConfig.items.push(item);
    this._updateValidationStatus();
    return item;
  }

  // Content removal methods
  removeNode(nodeId) {
    const index = this.worldConfig.nodes.findIndex(node => node.id === nodeId);
    if (index === -1) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    this.worldConfig.nodes.splice(index, 1);
    this._updateValidationStatus();
    return true;
  }

  removeCharacter(characterId) {
    const index = this.worldConfig.characters.findIndex(character => character.id === characterId);
    if (index === -1) {
      throw new Error(`Character not found: ${characterId}`);
    }

    this.worldConfig.characters.splice(index, 1);
    this._updateValidationStatus();
    return true;
  }

  removeInteraction(interactionId) {
    const index = this.worldConfig.interactions.findIndex(interaction => interaction.id === interactionId);
    if (index === -1) {
      throw new Error(`Interaction not found: ${interactionId}`);
    }

    this.worldConfig.interactions.splice(index, 1);
    this._updateValidationStatus();
    return true;
  }

  removeEvent(eventId) {
    const index = this.worldConfig.events.findIndex(event => event.id === eventId);
    if (index === -1) {
      throw new Error(`Event not found: ${eventId}`);
    }

    this.worldConfig.events.splice(index, 1);
    this._updateValidationStatus();
    return true;
  }

  removeGroup(groupId) {
    const index = this.worldConfig.groups.findIndex(group => group.id === groupId);
    if (index === -1) {
      throw new Error(`Group not found: ${groupId}`);
    }

    this.worldConfig.groups.splice(index, 1);
    this._updateValidationStatus();
    return true;
  }

  removeItem(itemId) {
    const index = this.worldConfig.items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error(`Item not found: ${itemId}`);
    }

    this.worldConfig.items.splice(index, 1);
    this._updateValidationStatus();
    return true;
  }

  // Template management methods
  saveAsTemplate(type, name, description) {
    if (!['world', 'characters', 'nodes', 'interactions', 'events', 'groups', 'items'].includes(type)) {
      throw new Error(`Invalid template type: ${type}`);
    }

    if (type === 'world') {
      const worldTemplate = {
        id: `world_${name}_${Date.now()}`,
        name: name,
        description: description,
        version: '1.0.0',
        tags: ['world', 'custom'],
        worldConfig: { ...this.worldConfig },
        metadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          author: 'User'
        }
      };

      this.templateManager.addTemplate('worlds', worldTemplate);
      return worldTemplate;
    } else {
      // Save individual content type as template
      const content = this.worldConfig[type];
      if (!content || content.length === 0) {
        throw new Error(`No ${type} content to save as template`);
      }

      const templates = content.map((item, index) => {
        const template = {
          ...item,
          id: `${name}_${type}_${index}_${Date.now()}`,
          name: `${name} ${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
          description: `${description} - ${type} template`,
          version: '1.0.0',
          tags: [type, 'custom'],
          metadata: {
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            author: 'User'
          }
        };

        this.templateManager.addTemplate(type, template);
        return template;
      });

      return templates;
    }
  }

  loadFromTemplate(templateId) {
    const worldTemplate = this.templateManager.getTemplate('worlds', templateId);
    if (!worldTemplate) {
      throw new Error(`World template not found: ${templateId}`);
    }

    this.worldConfig = { ...worldTemplate.worldConfig };
    this._updateValidationStatus();
    return this.worldConfig;
  }

  // Build and validation methods
  build() {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Cannot build invalid world: ${validation.errors.join(', ')}`);
    }

    // Create WorldState instance (will be implemented in task 3)
    return {
      id: this._generateId('world'),
      name: 'Generated World',
      ...this.worldConfig,
      isValid: true,
      validationResult: validation,
      createdAt: new Date(),
      modifiedAt: new Date()
    };
  }

  validate() {
    const errors = [];
    const warnings = [];

    // Validate dimensions
    if (!this._validateDimensions(this.worldConfig.dimensions)) {
      errors.push('Invalid or missing world dimensions');
    }

    // Validate nodes
    if (!this._validateNodes(this.worldConfig.nodes)) {
      errors.push('Invalid node configuration');
    }

    // Validate characters
    if (!this._validateCharacters(this.worldConfig.characters)) {
      errors.push('Invalid character configuration');
    }

    // Validate interactions
    if (!this._validateInteractions(this.worldConfig.interactions)) {
      warnings.push('Some interactions may not function properly');
    }

    // Validate events
    if (!this._validateEvents(this.worldConfig.events)) {
      warnings.push('Some events may not function properly');
    }

    // Validate character-node relationships
    if (!this._validateCharacterNodeRelationships(this.worldConfig.characters, this.worldConfig.nodes)) {
      errors.push('Characters must be assigned to valid nodes');
    }

    const isValid = errors.length === 0;
    const completeness = this._calculateCompleteness(this.worldConfig);

    return {
      isValid,
      errors,
      warnings,
      completeness
    };
  }

  reset() {
    this.worldConfig = {
      dimensions: null,
      rules: null,
      initialConditions: null,
      nodes: [],
      characters: [],
      interactions: [],
      events: [],
      groups: [],
      items: [],
      isComplete: false,
      isValid: false
    };
    return this;
  }

  // Getter methods
  getWorldConfig() {
    return { ...this.worldConfig };
  }

  getDimensions() {
    return this.worldConfig.dimensions;
  }

  getRules() {
    return this.worldConfig.rules;
  }

  getInitialConditions() {
    return this.worldConfig.initialConditions;
  }

  getNodes() {
    return [...this.worldConfig.nodes];
  }

  getCharacters() {
    return [...this.worldConfig.characters];
  }

  getInteractions() {
    return [...this.worldConfig.interactions];
  }

  getEvents() {
    return [...this.worldConfig.events];
  }

  getGroups() {
    return [...this.worldConfig.groups];
  }

  getItems() {
    return [...this.worldConfig.items];
  }

  // Private helper methods
  _applyCustomizations(template, customizations) {
    const instance = { ...template };
    
    // Apply field-level customizations
    Object.keys(customizations).forEach(key => {
      if (customizations[key] !== undefined) {
        instance[key] = customizations[key];
      }
    });

    return instance;
  }

  _generateInstanceId(templateId) {
    return `${templateId}_instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateId(type) {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _updateValidationStatus() {
    const validation = this.validate();
    this.worldConfig.isValid = validation.isValid;
    this.worldConfig.isComplete = validation.completeness >= 0.8; // 80% completeness threshold
  }

  // Validation helper methods
  _validateDimensions(dimensions) {
    return dimensions && 
           typeof dimensions.width === 'number' && dimensions.width > 0 &&
           typeof dimensions.height === 'number' && dimensions.height > 0;
  }

  _validateNodes(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return false;
    }

    return nodes.every(node => 
      node.id && 
      node.name && 
      node.position &&
      typeof node.position.x === 'number' &&
      typeof node.position.y === 'number'
    );
  }

  _validateCharacters(characters) {
    if (!Array.isArray(characters)) {
      return false;
    }

    return characters.every(character =>
      character.id &&
      character.name &&
      character.attributes &&
      typeof character.attributes === 'object'
    );
  }

  _validateInteractions(interactions) {
    if (!Array.isArray(interactions)) {
      return true; // Interactions are optional
    }

    return interactions.every(interaction =>
      interaction.id &&
      interaction.name &&
      interaction.type
    );
  }

  _validateEvents(events) {
    if (!Array.isArray(events)) {
      return true; // Events are optional
    }

    return events.every(event =>
      event.id &&
      event.name
    );
  }

  _validateCharacterNodeRelationships(characters, nodes) {
    if (!Array.isArray(characters) || !Array.isArray(nodes)) {
      return true; // Skip if either is missing
    }

    const nodeIds = new Set(nodes.map(node => node.id));
    return characters.every(character => 
      !character.currentNodeId || nodeIds.has(character.currentNodeId)
    );
  }

  _calculateCompleteness(worldConfig) {
    let score = 0;
    let maxScore = 0;

    // Dimensions (required)
    maxScore += 20;
    if (this._validateDimensions(worldConfig.dimensions)) {
      score += 20;
    }

    // Nodes (required)
    maxScore += 30;
    if (this._validateNodes(worldConfig.nodes)) {
      score += 30;
    }

    // Characters (recommended)
    maxScore += 25;
    if (worldConfig.characters && worldConfig.characters.length > 0) {
      score += 25;
    }

    // Interactions (optional)
    maxScore += 15;
    if (worldConfig.interactions && worldConfig.interactions.length > 0) {
      score += 15;
    }

    // Events (optional)
    maxScore += 10;
    if (worldConfig.events && worldConfig.events.length > 0) {
      score += 10;
    }

    return score / maxScore;
  }
}

export default WorldBuilder;