/**
 * WorldBuilder - Core world builder infrastructure for six-step flow
 * Implements mappless world configuration with step-by-step progression tracking
 * Enforces dependency chain validation and provides methods for each step
 */

class WorldBuilder {
  constructor(templateManager = null) {
    this.templateManager = templateManager;
    this.currentStep = 1;

    // Mappless world configuration (no dimensions, abstract nodes)
    this.worldConfig = {
      // Step 1: World properties (no spatial dimensions)
      name: null,
      description: null,
      rules: null,
      initialConditions: null,

      // Step 2: Abstract nodes (no coordinates)
      nodes: [],

      // Step 3: Character capabilities
      interactions: [],

      // Step 4: Characters with assigned capabilities
      characters: [],

      // Step 5: Character-to-node assignments
      nodePopulations: {},

      // Validation state
      isComplete: false,
      isValid: false,
      stepValidation: {
        1: false, // World created
        2: false, // Nodes created
        3: false, // Interactions created
        4: false, // Characters created
        5: false, // Nodes populated
        6: false  // Ready for simulation
      }
    };
  }

  // Step 1: World creation methods (no spatial dimensions)

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
    this._validateStep(1);
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
    this._validateStep(1);
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
    this._validateStep(1);
    return this;
  }

  // Step 2: Node creation methods (abstract locations, no coordinates)

  /**
   * Adds an abstract node (location/context) to the world
   * @param {Object} nodeConfig - Node configuration
   * @returns {WorldBuilder} This instance for chaining
   */
  addNode(nodeConfig) {
    if (!this.canProceedToStep(2)) {
      throw new Error('Cannot add nodes until world properties are set (Step 1)');
    }

    if (!nodeConfig || typeof nodeConfig !== 'object') {
      throw new Error('Node configuration must be an object');
    }

    // Required fields for mappless nodes
    const requiredFields = ['name', 'type', 'description'];
    for (const field of requiredFields) {
      if (!nodeConfig[field]) {
        throw new Error(`Node ${field} is required`);
      }
    }

    // Ensure no spatial coordinates in mappless system
    if (nodeConfig.position || nodeConfig.x !== undefined || nodeConfig.y !== undefined) {
      throw new Error('Spatial coordinates not allowed in mappless system');
    }

    const node = {
      id: nodeConfig.id || this._generateId('node'),
      name: nodeConfig.name,
      type: nodeConfig.type,
      description: nodeConfig.description,
      environmentalProperties: nodeConfig.environmentalProperties || {},
      resourceAvailability: nodeConfig.resourceAvailability || {},
      culturalContext: nodeConfig.culturalContext || {},
      connections: nodeConfig.connections || [], // Conceptual connections
      ...nodeConfig
    };

    this.worldConfig.nodes.push(node);
    this._validateStep(2);
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

  // Step 3: Interaction creation methods (character capabilities)

  /**
   * Adds an interaction (character capability) to the world
   * @param {Object} interactionConfig - Interaction configuration
   * @returns {WorldBuilder} This instance for chaining
   */
  addInteraction(interactionConfig) {
    if (!this.canProceedToStep(3)) {
      throw new Error('Cannot add interactions until at least one node exists (Step 2)');
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
    this._validateStep(3);
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

  // Step 4: Character creation methods (with capability assignment)

  /**
   * Adds a character with assigned capabilities to the world
   * @param {Object} characterConfig - Character configuration
   * @returns {WorldBuilder} This instance for chaining
   */
  addCharacter(characterConfig) {
    if (!this.canProceedToStep(4)) {
      throw new Error('Cannot add characters until both nodes and interactions exist (Steps 2-3)');
    }

    if (!characterConfig || typeof characterConfig !== 'object') {
      throw new Error('Character configuration must be an object');
    }

    // Required fields for characters
    const requiredFields = ['name', 'attributes', 'assignedInteractions'];
    for (const field of requiredFields) {
      if (!characterConfig[field]) {
        throw new Error(`Character ${field} is required`);
      }
    }

    // Validate D&D attributes
    const requiredAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const attr of requiredAttributes) {
      if (typeof characterConfig.attributes[attr] !== 'number') {
        throw new Error(`Character attribute ${attr} must be a number`);
      }
    }

    // Validate assigned interactions exist
    if (!Array.isArray(characterConfig.assignedInteractions) || characterConfig.assignedInteractions.length === 0) {
      throw new Error('Character must have at least one assigned interaction');
    }

    const interactionIds = new Set(this.worldConfig.interactions.map(i => i.id));
    for (const interactionId of characterConfig.assignedInteractions) {
      if (!interactionIds.has(interactionId)) {
        throw new Error(`Assigned interaction '${interactionId}' does not exist`);
      }
    }

    // Ensure character is not yet placed in nodes (Step 5)
    if (characterConfig.currentNodeId) {
      throw new Error('Characters should not be assigned to nodes yet (Step 5)');
    }

    const character = {
      id: characterConfig.id || this._generateId('character'),
      name: characterConfig.name,
      attributes: { ...characterConfig.attributes },
      assignedInteractions: [...characterConfig.assignedInteractions],
      personality: characterConfig.personality || {},
      consciousness: characterConfig.consciousness || {},
      skills: characterConfig.skills || {},
      goals: characterConfig.goals || [],
      ...characterConfig
    };

    this.worldConfig.characters.push(character);
    this._validateStep(4);
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

  // Step 5: Node population methods (assign characters to nodes)

  /**
   * Assigns a character to a specific node
   * @param {string} characterId - Character ID
   * @param {string} nodeId - Node ID
   * @returns {WorldBuilder} This instance for chaining
   */
  assignCharacterToNode(characterId, nodeId) {
    if (!this.canProceedToStep(5)) {
      throw new Error('Cannot populate nodes until both nodes and characters exist (Steps 2-4)');
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

    this._validateStep(5);
    return this;
  }

  /**
   * Populates a node with multiple characters
   * @param {string} nodeId - Node ID
   * @param {Array} characterIds - Array of character IDs
   * @returns {WorldBuilder} This instance for chaining
   */
  populateNode(nodeId, characterIds) {
    if (!Array.isArray(characterIds)) {
      throw new Error('Character IDs must be an array');
    }

    for (const characterId of characterIds) {
      this.assignCharacterToNode(characterId, nodeId);
    }

    return this;
  }

  // Step validation methods

  /**
   * Validates a specific step
   * @param {number} stepNumber - Step number to validate
   * @returns {boolean} True if step is valid
   */
  validateStep(stepNumber) {
    return this._validateStep(stepNumber);
  }

  /**
   * Checks if can proceed to a specific step
   * @param {number} stepNumber - Step number to check
   * @returns {boolean} True if can proceed to step
   */
  canProceedToStep(stepNumber) {
    switch (stepNumber) {
      case 1:
        return true; // Can always start with step 1
      case 2:
        return this.worldConfig.stepValidation[1]; // Need world properties
      case 3:
        return this.worldConfig.stepValidation[2]; // Need nodes
      case 4:
        return this.worldConfig.stepValidation[3]; // Need interactions
      case 5:
        return this.worldConfig.stepValidation[4]; // Need characters
      case 6:
        return this.worldConfig.stepValidation[5]; // Need populated nodes
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

    // Validate all steps
    for (let step = 1; step <= 6; step++) {
      this._validateStep(step);
    }

    return this;
  }

  // Build and validation

  /**
   * Builds and returns the final world state
   * @returns {Object} World state configuration
   */
  build() {
    // Validate all steps before building
    for (let step = 1; step <= 6; step++) {
      if (!this.worldConfig.stepValidation[step]) {
        throw new Error(`Cannot build world: Step ${step} validation failed`);
      }
    }

    return {
      ...this.worldConfig,
      isComplete: true,
      isValid: true,
      builtAt: new Date().toISOString()
    };
  }

  /**
   * Validates the entire world configuration
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];
    const stepResults = {};

    // Validate each step
    for (let step = 1; step <= 6; step++) {
      const stepValid = this._validateStep(step);
      stepResults[step] = stepValid;

      if (!stepValid) {
        errors.push(`Step ${step} validation failed`);
      }
    }

    // Additional cross-step validations
    if (this.worldConfig.characters.length > 0 && this.worldConfig.nodes.length === 0) {
      errors.push('Characters exist but no nodes defined');
    }

    if (this.worldConfig.interactions.length > 0 && this.worldConfig.characters.length === 0) {
      warnings.push('Interactions defined but no characters to use them');
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      stepValidation: stepResults,
      completeness: this._calculateCompleteness()
    };
  }

  /**
   * Resets the world builder to initial state
   * @returns {WorldBuilder} This instance for chaining
   */
  reset() {
    this.currentStep = 1;
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
      stepValidation: {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false
      }
    };
    return this;
  }

  // Private helper methods

  /**
   * Internal step validation logic
   * @param {number} stepNumber - Step number to validate
   * @returns {boolean} True if step is valid
   */
  _validateStep(stepNumber) {
    let isValid = false;

    switch (stepNumber) {
      case 1: // World properties
        isValid = !!(this.worldConfig.name &&
          this.worldConfig.description &&
          this.worldConfig.rules &&
          this.worldConfig.initialConditions);
        break;
      case 2: // Nodes
        isValid = this.worldConfig.stepValidation[1] &&
          this.worldConfig.nodes.length > 0;
        break;
      case 3: // Interactions
        isValid = this.worldConfig.stepValidation[2] &&
          this.worldConfig.interactions.length > 0;
        break;
      case 4: // Characters
        isValid = this.worldConfig.stepValidation[3] &&
          this.worldConfig.characters.length > 0 &&
          this.worldConfig.characters.every(c =>
            c.assignedInteractions && c.assignedInteractions.length > 0);
        break;
      case 5: // Node populations
        isValid = this.worldConfig.stepValidation[4] &&
          this.worldConfig.nodes.every(node =>
            this.worldConfig.nodePopulations[node.id] &&
            this.worldConfig.nodePopulations[node.id].length > 0);
        break;
      case 6: // Simulation ready
        isValid = this.worldConfig.stepValidation[5];
        break;
      default:
        isValid = false;
        break;
    }

    this.worldConfig.stepValidation[stepNumber] = isValid;

    // Update current step to highest valid step
    if (isValid && stepNumber > this.currentStep) {
      this.currentStep = stepNumber;
    }

    return isValid;
  }

  /**
   * Calculates completeness score
   * @returns {number} Completeness score between 0 and 1
   */
  _calculateCompleteness() {
    const validSteps = Object.values(this.worldConfig.stepValidation).filter(Boolean).length;
    return validSteps / 6;
  }

  /**
   * Generates a unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Generated ID
   */
  _generateId(prefix = 'item') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export default WorldBuilder;