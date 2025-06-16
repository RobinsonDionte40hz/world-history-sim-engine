import { World } from '../types/simulation/World';
import { SimulationCharacter } from '../types/simulation/SimulationCharacter';
import { Settlement } from '../types/simulation/Settlement';
import { CharacterTemplate } from '../types/templates/CharacterTemplate';
import { NodeTemplate } from '../types/templates/NodeTemplate';
import { GroupTemplate } from '../types/templates/GroupTemplate';
import TemplateManager from '../template/TemplateManager';

class WorldGenerator {
  constructor() {
    this.templates = {
      characters: new Map(),
      nodes: new Map(),
      groups: new Map()
    };
  }

  // World generation configuration
  generateWorld(config) {
    const {
      size,
      nodeCount,
      resourceTypes,
      initialPopulation,
      simulationYears,
      useExistingQuests,
      attributeGeneration,
      consciousnessEnabled
    } = config;

    // Generate world nodes
    this.generateNodes(size, nodeCount, resourceTypes);

    // Generate initial population
    this.generatePopulation(initialPopulation, attributeGeneration, consciousnessEnabled);

    // Generate initial settlements and groups
    this.generateInitialGroups();

    // Initialize historical records
    this.initializeHistory();

    return this.world;
  }

  // Node generation
  generateNodes(size, nodeCount, resourceTypes) {
    const { width, height } = size;
    const nodeTemplates = this.templateManager.listTemplates('nodes');

    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      // Select appropriate node template based on location
      const template = this.selectNodeTemplate(x, y, width, height, nodeTemplates);
      
      // Generate node with template
      const node = this.generateNodeFromTemplate(template, x, y, resourceTypes);
      
      this.world.nodes.set(node.id, node);
    }

    // Generate connections between nodes
    this.generateNodeConnections();
  }

  // Node template selection based on location
  selectNodeTemplate(x, y, width, height, templates) {
    // Simple example: select based on distance from center
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );
    const maxDistance = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2;

    // Weight templates based on distance from center
    const weightedTemplates = templates.map(template => ({
      template,
      weight: this.calculateTemplateWeight(template, distance, maxDistance)
    }));

    // Select template based on weights
    return this.selectWeightedRandom(weightedTemplates);
  }

  // Calculate template weight based on distance
  calculateTemplateWeight(template, distance, maxDistance) {
    const normalizedDistance = distance / maxDistance;
    // Example: mountains more common at edges, plains in center
    if (template.name.includes('mountain')) {
      return normalizedDistance;
    }
    if (template.name.includes('plains')) {
      return 1 - normalizedDistance;
    }
    return 0.5;
  }

  // Generate node from template
  generateNodeFromTemplate(template, x, y, resourceTypes) {
    const node = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      position: { x, y },
      features: this.generateFeatures(template.baseFeatures),
      resources: this.generateResources(template.resourcePotential, resourceTypes),
      environmentalConditions: this.generateEnvironmentalConditions(
        template.environmentalConditions
      ),
      settlementCapacity: this.generateSettlementCapacity(
        template.settlementCapacity
      ),
      modifiers: this.generateModifiers(template.modifierSlots),
      quests: template.questPotential.availableQuests || []
    };

    return node;
  }

  // Feature generation
  generateFeatures(baseFeatures) {
    return baseFeatures.map(feature => ({
      ...feature,
      active: Math.random() < 0.7 // 70% chance of feature being active
    }));
  }

  // Resource generation
  generateResources(resourcePotential, resourceTypes) {
    const resources = {};
    for (const resourceType of resourceTypes) {
      const potential = resourcePotential.resources[resourceType] || 0;
      resources[resourceType] = Math.floor(Math.random() * potential);
    }
    return resources;
  }

  // Environmental condition generation
  generateEnvironmentalConditions(conditions) {
    return conditions.filter(condition => 
      Math.random() < (condition.probability || 0.5)
    );
  }

  // Settlement capacity generation
  generateSettlementCapacity(capacity) {
    return {
      minPopulation: capacity.minPopulation,
      maxPopulation: capacity.maxPopulation,
      growthRate: capacity.growthRate * (0.8 + Math.random() * 0.4) // ±20% variation
    };
  }

  // Modifier generation
  generateModifiers(modifierSlots) {
    return modifierSlots.map(slot => ({
      ...slot,
      active: Math.random() < 0.5 // 50% chance of modifier being active
    }));
  }

  // Node connection generation
  generateNodeConnections() {
    const nodes = Array.from(this.world.nodes.values());
    
    // Generate connections based on distance
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = this.calculateDistance(nodes[i], nodes[j]);
        if (distance < 100) { // Example threshold
          this.createConnection(nodes[i], nodes[j]);
        }
      }
    }
  }

  // Distance calculation
  calculateDistance(node1, node2) {
    return Math.sqrt(
      Math.pow(node1.position.x - node2.position.x, 2) +
      Math.pow(node1.position.y - node2.position.y, 2)
    );
  }

  // Connection creation
  createConnection(node1, node2) {
    const connection = {
      id: `conn_${node1.id}_${node2.id}`,
      nodes: [node1.id, node2.id],
      distance: this.calculateDistance(node1, node2),
      type: this.determineConnectionType(node1, node2)
    };

    // Add connection to both nodes
    node1.connections = node1.connections || [];
    node2.connections = node2.connections || [];
    node1.connections.push(connection);
    node2.connections.push(connection);
  }

  // Connection type determination
  determineConnectionType(node1, node2) {
    // Example: determine connection type based on node features
    if (node1.features.some(f => f.name === 'river') &&
        node2.features.some(f => f.name === 'river')) {
      return 'river';
    }
    if (node1.features.some(f => f.name === 'mountain') ||
        node2.features.some(f => f.name === 'mountain')) {
      return 'mountain_pass';
    }
    return 'road';
  }

  // Population generation
  generatePopulation(count, attributeGeneration, consciousnessEnabled) {
    const characterTemplates = this.templateManager.listTemplates('characters');

    for (let i = 0; i < count; i++) {
      const template = this.selectRandomTemplate(characterTemplates);
      const character = this.generateCharacterFromTemplate(
        template,
        attributeGeneration,
        consciousnessEnabled
      );
      this.world.characters.set(character.id, character);
    }
  }

  // Character generation from template
  generateCharacterFromTemplate(template, attributeGeneration, consciousnessEnabled) {
    const character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      name: this.generateCharacterName(template),
      attributes: this.generateAttributes(template.attributeDistribution, attributeGeneration),
      skills: this.generateSkills(template.skillDistribution),
      traits: this.generateTraits(template.baseTraits),
      goals: this.generateGoals(template.goalTypes),
      behaviorPatterns: template.behaviorPatterns,
      culturalModifiers: template.culturalModifiers,
      consciousness: consciousnessEnabled ? this.generateConsciousness(template.consciousnessTemplate) : null
    };

    return character;
  }

  // Character name generation
  generateCharacterName(template) {
    // Implement name generation logic based on template
    return `Character_${Math.random().toString(36).substr(2, 5)}`;
  }

  // Attribute generation
  generateAttributes(distribution, method) {
    const attributes = {};
    for (const [attr, config] of Object.entries(distribution)) {
      switch (method) {
        case 'dice_roll':
          attributes[attr] = this.rollDnDAttribute();
          break;
        case 'point_buy':
          attributes[attr] = this.pointBuyAttribute();
          break;
        default:
          attributes[attr] = this.randomInRange(config.min, config.max);
      }
    }
    return attributes;
  }

  // D&D style attribute roll
  rollDnDAttribute() {
    const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, val) => sum + val, 0);
  }

  // Point buy attribute generation
  pointBuyAttribute() {
    // Implement point buy system
    return 10; // Default value
  }

  // Random number in range
  randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Skill generation
  generateSkills(distribution) {
    const skills = {};
    for (const [skill, config] of Object.entries(distribution)) {
      skills[skill] = {
        level: 0,
        experience: 0,
        governingAttribute: config.attribute,
        proficiencyBonus: 0
      };
    }
    return skills;
  }

  // Trait generation
  generateTraits(baseTraits) {
    return Object.entries(baseTraits).reduce((traits, [trait, value]) => {
      traits[trait] = value * (0.8 + Math.random() * 0.4); // ±20% variation
      return traits;
    }, {});
  }

  // Goal generation
  generateGoals(goalTypes) {
    return goalTypes
      .filter(() => Math.random() < 0.7) // 70% chance of having each goal
      .map(type => ({
        type,
        progress: 0,
        completed: false
      }));
  }

  // Consciousness generation
  generateConsciousness(template) {
    return {
      state: template.baseState,
      evolutionRules: template.evolutionRules,
      history: []
    };
  }

  // Initial group generation
  generateInitialGroups() {
    const groupTemplates = this.templateManager.listTemplates('groups');
    const nodes = Array.from(this.world.nodes.values());

    // Generate settlements
    this.generateSettlements(nodes, groupTemplates);

    // Generate kingdoms
    this.generateKingdoms(nodes, groupTemplates);
  }

  // Settlement generation
  generateSettlements(nodes, templates) {
    const settlementTemplate = templates.find(t => t.name.includes('settlement'));
    if (!settlementTemplate) return;

    // Generate settlements at suitable nodes
    nodes.forEach(node => {
      if (this.isSuitableForSettlement(node) && Math.random() < 0.3) {
        const settlement = this.generateGroupFromTemplate(
          settlementTemplate,
          node
        );
        this.world.groups.set(settlement.id, settlement);
      }
    });
  }

  // Kingdom generation
  generateKingdoms(nodes, templates) {
    const kingdomTemplate = templates.find(t => t.name.includes('kingdom'));
    if (!kingdomTemplate) return;

    // Generate kingdoms around major settlements
    const settlements = Array.from(this.world.groups.values())
      .filter(g => g.type === 'settlement');

    settlements.forEach(settlement => {
      if (Math.random() < 0.2) { // 20% chance of kingdom formation
        const kingdom = this.generateGroupFromTemplate(
          kingdomTemplate,
          settlement.location
        );
        this.world.groups.set(kingdom.id, kingdom);
      }
    });
  }

  // Group generation from template
  generateGroupFromTemplate(template, location) {
    return {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      type: template.name,
      location: location.id,
      members: [],
      hierarchy: this.generateHierarchy(template.hierarchy),
      resources: this.generateGroupResources(template.resourceManagement),
      influence: this.generateInfluence(template.influenceSystem),
      prestige: this.generatePrestige(template.prestigeSystem),
      alignment: this.generateAlignment(template.alignmentSystem),
      quests: template.questSystem.availableQuests || []
    };
  }

  // Hierarchy generation
  generateHierarchy(hierarchy) {
    return {
      levels: hierarchy.levels.map(level => ({
        ...level,
        members: []
      })),
      successionRules: hierarchy.successionRules
    };
  }

  // Group resource generation
  generateGroupResources(management) {
    return {
      production: this.generateResourceManagement(management.production),
      consumption: this.generateResourceManagement(management.consumption),
      storage: this.generateResourceManagement(management.storage)
    };
  }

  // Resource management generation
  generateResourceManagement(management) {
    return Object.entries(management).reduce((resources, [resource, value]) => {
      resources[resource] = value * (0.8 + Math.random() * 0.4); // ±20% variation
      return resources;
    }, {});
  }

  // Influence generation
  generateInfluence(system) {
    return {
      domains: system.domains.reduce((domains, domain) => {
        domains[domain] = Math.random() * 100;
        return domains;
      }, {}),
      mechanics: system.mechanics
    };
  }

  // Prestige generation
  generatePrestige(system) {
    return {
      factors: system.factors.reduce((factors, factor) => {
        factors[factor] = Math.random() * 100;
        return factors;
      }, {}),
      mechanics: system.mechanics
    };
  }

  // Alignment generation
  generateAlignment(system) {
    return {
      factors: system.factors.reduce((factors, factor) => {
        factors[factor] = Math.random() * 100;
        return factors;
      }, {}),
      mechanics: system.mechanics
    };
  }

  // Settlement suitability check
  isSuitableForSettlement(node) {
    return (
      node.settlementCapacity.maxPopulation > 100 &&
      node.resources.food > 50 &&
      !node.features.some(f => f.name === 'mountain')
    );
  }

  // Template selection helpers
  selectRandomTemplate(templates) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  selectWeightedRandom(weightedItems) {
    const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of weightedItems) {
      random -= item.weight;
      if (random <= 0) return item.template;
    }
    
    return weightedItems[0].template;
  }

  // History initialization
  initializeHistory() {
    this.world.history = [{
      timestamp: 0,
      events: this.generateInitialEvents()
    }];
  }

  // Initial event generation
  generateInitialEvents() {
    const events = [];
    
    // Add settlement founding events
    this.world.groups.forEach(group => {
      if (group.type === 'settlement') {
        events.push({
          type: 'settlement_founded',
          groupId: group.id,
          location: group.location,
          timestamp: 0
        });
      }
    });

    // Add kingdom formation events
    this.world.groups.forEach(group => {
      if (group.type === 'kingdom') {
        events.push({
          type: 'kingdom_formed',
          groupId: group.id,
          location: group.location,
          timestamp: 0
        });
      }
    });

    return events;
  }
}

export default WorldGenerator; 